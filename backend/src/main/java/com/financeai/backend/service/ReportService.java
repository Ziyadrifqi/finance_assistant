package com.financeai.backend.service;

import com.financeai.backend.dto.BudgetResponse;
import com.financeai.backend.dto.CategoryBreakdownResponse;
import com.financeai.backend.dto.ReportResponse;
import com.financeai.backend.entity.CategoryType;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final DashboardService dashboardService;
    private final EmailService emailService;

    public ReportResponse getReport(String email, Integer month, Integer year) {
        User user = findUser(email);
        YearMonth ym = YearMonth.of(year, month);
        YearMonth prevYm = ym.minusMonths(1);

        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                user, CategoryType.INCOME, ym.atDay(1), ym.atEndOfMonth());
        BigDecimal totalExpense = transactionRepository.sumByUserAndTypeAndDateRange(
                user, CategoryType.EXPENSE, ym.atDay(1), ym.atEndOfMonth());
        BigDecimal prevExpense = transactionRepository.sumByUserAndTypeAndDateRange(
                user, CategoryType.EXPENSE, prevYm.atDay(1), prevYm.atEndOfMonth());

        List<CategoryBreakdownResponse> breakdown = dashboardService.getExpenseBreakdown(email, month, year);
        List<BudgetResponse> budgets = budgetService.getByMonth(email, month, year);

        return ReportResponse.builder()
                .month(month)
                .year(year)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .previousMonthExpense(prevExpense)
                .categoryBreakdown(breakdown)
                .budgetStatus(budgets)
                .build();
    }

    public void sendReportEmail(String email, Integer month, Integer year) {
        User user = findUser(email);
        ReportResponse report = getReport(email, month, year);
        String html = buildHtmlReport(user.getFullName(), report);
        emailService.sendHtmlEmail(email, "Laporan Keuangan Bulanan - Finance AI", html);
    }

    private String buildHtmlReport(String fullName, ReportResponse report) {
        String monthName = new java.text.DateFormatSymbols(new Locale("id", "ID"))
                .getMonths()[report.getMonth() - 1];

        StringBuilder categoryRows = new StringBuilder();
        for (CategoryBreakdownResponse c : report.getCategoryBreakdown()) {
            categoryRows.append(String.format(
                    "<tr><td style='padding:6px 0'>%s %s</td><td style='padding:6px 0;text-align:right'>%s</td></tr>",
                    c.getIcon(), c.getCategoryName(), formatRupiah(c.getTotal())
            ));
        }

        StringBuilder budgetRows = new StringBuilder();
        for (BudgetResponse b : report.getBudgetStatus()) {
            boolean over = b.getSpentAmount().compareTo(b.getLimitAmount()) > 0;
            String status = over ? "<span style='color:#ef4444'>Melebihi limit</span>" : "<span style='color:#10b981'>Aman</span>";
            budgetRows.append(String.format(
                    "<tr><td style='padding:6px 0'>%s %s</td><td style='padding:6px 0;text-align:right'>%s / %s</td><td style='padding:6px 0;text-align:right'>%s</td></tr>",
                    b.getCategory().getIcon(), b.getCategory().getName(),
                    formatRupiah(b.getSpentAmount()), formatRupiah(b.getLimitAmount()), status
            ));
        }

        return String.format("""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
                    <h2 style="color:#7c3aed">Laporan Keuangan - %s %d</h2>
                    <p>Halo %s, berikut ringkasan keuanganmu bulan ini:</p>

                    <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                        <tr><td style="padding:6px 0">Total Pemasukan</td><td style="padding:6px 0;text-align:right;color:#10b981;font-weight:bold">%s</td></tr>
                        <tr><td style="padding:6px 0">Total Pengeluaran</td><td style="padding:6px 0;text-align:right;color:#ef4444;font-weight:bold">%s</td></tr>
                        <tr><td style="padding:6px 0">Pengeluaran Bulan Lalu</td><td style="padding:6px 0;text-align:right">%s</td></tr>
                    </table>

                    <h3>Pengeluaran per Kategori</h3>
                    <table style="width:100%%;border-collapse:collapse">%s</table>

                    <h3>Status Budget</h3>
                    <table style="width:100%%;border-collapse:collapse">%s</table>

                    <p style="margin-top:24px;font-size:12px;color:#78716c">Email ini dikirim otomatis oleh Finance AI.</p>
                </div>
                """,
                monthName, report.getYear(), fullName,
                formatRupiah(report.getTotalIncome()),
                formatRupiah(report.getTotalExpense()),
                formatRupiah(report.getPreviousMonthExpense()),
                categoryRows,
                budgetRows
        );
    }

    private String formatRupiah(BigDecimal amount) {
        return "Rp " + String.format("%,.0f", amount).replace(",", ".");
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }
}