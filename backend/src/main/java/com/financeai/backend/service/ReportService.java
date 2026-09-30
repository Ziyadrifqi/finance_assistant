package com.financeai.backend.service;

import com.financeai.backend.dto.BudgetResponse;
import com.financeai.backend.dto.CategoryBreakdownResponse;
import com.financeai.backend.dto.ReportResponse;
import com.financeai.backend.entity.Category;
import com.financeai.backend.entity.CategoryType;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.CategoryRepository;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final EmailService emailService;

    /**
     * Mengambil laporan berdasarkan rentang tanggal.
     *
     * Bisa digunakan untuk:
     * - 1 bulan
     * - 1 tahun
     * - custom date range
     */
    public ReportResponse getReportForRange(
            String email,
            LocalDate start,
            LocalDate end
    ) {
        validateDateRange(start, end);

        User user = findUser(email);

        // =========================
        // TOTAL PEMASUKAN
        // =========================
        BigDecimal totalIncome =
                transactionRepository.sumByUserAndTypeAndDateRange(
                        user,
                        CategoryType.INCOME,
                        start,
                        end
                );

        // =========================
        // TOTAL PENGELUARAN
        // =========================
        BigDecimal totalExpense =
                transactionRepository.sumByUserAndTypeAndDateRange(
                        user,
                        CategoryType.EXPENSE,
                        start,
                        end
                );

        totalIncome = safeAmount(totalIncome);
        totalExpense = safeAmount(totalExpense);

        // =========================
        // PERIODE SEBELUMNYA
        // =========================
        long daysInRange =
                ChronoUnit.DAYS.between(start, end) + 1;

        LocalDate previousEnd = start.minusDays(1);

        LocalDate previousStart =
                previousEnd.minusDays(daysInRange - 1);

        BigDecimal previousExpense =
                transactionRepository.sumByUserAndTypeAndDateRange(
                        user,
                        CategoryType.EXPENSE,
                        previousStart,
                        previousEnd
                );

        previousExpense = safeAmount(previousExpense);

        // =========================
        // BREAKDOWN KATEGORI
        // =========================
        List<CategoryBreakdownResponse> breakdown =
                getExpenseBreakdownForRange(
                        user,
                        start,
                        end
                );

        // =========================
        // BUDGET
        // =========================
        List<BudgetResponse> budgets = List.of();

        /*
         * Budget hanya digunakan jika range merupakan
         * satu bulan kalender penuh.
         */
        boolean isSingleFullMonth =
                start.equals(start.withDayOfMonth(1))
                        && end.equals(
                        YearMonth.from(start).atEndOfMonth()
                )
                        && YearMonth.from(start)
                        .equals(YearMonth.from(end));

        if (isSingleFullMonth) {
            budgets = budgetService.getByMonth(
                    email,
                    start.getMonthValue(),
                    start.getYear()
            );
        }

        // =========================
        // BUILD RESPONSE
        // =========================
        return ReportResponse.builder()
                .month(start.getMonthValue())
                .year(start.getYear())
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .previousMonthExpense(previousExpense)
                .categoryBreakdown(breakdown)
                .budgetStatus(budgets)
                .build();
    }

    /**
     * Mengambil laporan untuk satu bulan penuh.
     */
    public ReportResponse getReport(
            String email,
            Integer month,
            Integer year
    ) {
        if (month == null || year == null) {
            throw new IllegalArgumentException(
                    "Bulan dan tahun wajib diisi"
            );
        }

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.of(year, month);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Bulan atau tahun tidak valid"
            );
        }

        return getReportForRange(
                email,
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );
    }

    /**
     * Mengirim laporan melalui email.
     */
    public void sendReportEmail(
            String email,
            LocalDate start,
            LocalDate end
    ) {
        validateDateRange(start, end);

        User user = findUser(email);

        ReportResponse report =
                getReportForRange(
                        email,
                        start,
                        end
                );

        String html =
                buildHtmlReport(
                        user.getFullName(),
                        report,
                        start,
                        end
                );

        emailService.sendHtmlEmail(
                email,
                "Laporan Keuangan - Finance AI",
                html
        );
    }

    /**
     * Generate laporan dalam bentuk PDF.
     */
    public byte[] generatePdf(
            String email,
            LocalDate start,
            LocalDate end
    ) {
        validateDateRange(start, end);

        User user = findUser(email);

        ReportResponse report =
                getReportForRange(
                        email,
                        start,
                        end
                );

        String html =
                buildHtmlReport(
                        user.getFullName(),
                        report,
                        start,
                        end
                );

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            com.openhtmltopdf.pdfboxout.PdfRendererBuilder builder =
                    new com.openhtmltopdf.pdfboxout.PdfRendererBuilder();

            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Gagal membuat PDF: " + e.getMessage(),
                    e
            );
        }
    }

    /**
     * Mengambil breakdown pengeluaran berdasarkan kategori
     * untuk rentang tanggal tertentu.
     */
    private List<CategoryBreakdownResponse> getExpenseBreakdownForRange(
            User user,
            LocalDate start,
            LocalDate end
    ) {
        List<Category> categories =
                categoryRepository
                        .findByUserOrderByNameAsc(user)
                        .stream()
                        .filter(category ->
                                category.getType()
                                        == CategoryType.EXPENSE
                        )
                        .toList();

        return categories.stream()
                .map(category -> {

                    BigDecimal total =
                            transactionRepository
                                    .sumByUserAndCategoryAndDateRange(
                                            user,
                                            category.getId(),
                                            start,
                                            end
                                    );

                    total = safeAmount(total);

                    return CategoryBreakdownResponse.builder()
                            .categoryName(category.getName())
                            .icon(category.getIcon())
                            .color(category.getColor())
                            .total(total)
                            .build();
                })
                .filter(category ->
                        category.getTotal()
                                .compareTo(BigDecimal.ZERO) > 0
                )
                .toList();
    }

    /**
     * Membuat HTML untuk email dan PDF.
     */
    private String buildHtmlReport(
            String fullName,
            ReportResponse report,
            LocalDate start,
            LocalDate end
    ) {
        String periodLabel =
                formatPeriodLabel(start, end);

        // =========================
        // CATEGORY ROWS
        // =========================
        StringBuilder categoryRows =
                new StringBuilder();

        for (CategoryBreakdownResponse category :
                report.getCategoryBreakdown()) {

            categoryRows.append(
                    String.format(
                            """
                            <tr>
                                <td style='padding:6px 0'>
                                    %s %s
                                </td>
                                <td style='padding:6px 0;text-align:right'>
                                    %s
                                </td>
                            </tr>
                            """,
                            category.getIcon(),
                            category.getCategoryName(),
                            formatRupiah(
                                    category.getTotal()
                            )
                    )
            );
        }

        if (categoryRows.isEmpty()) {
            categoryRows.append(
                    """
                    <tr>
                        <td style='padding:6px 0;color:#78716c'>
                            Tidak ada pengeluaran pada periode ini.
                        </td>
                    </tr>
                    """
            );
        }

        // =========================
        // BUDGET ROWS
        // =========================
        StringBuilder budgetRows =
                new StringBuilder();

        for (BudgetResponse budget :
                report.getBudgetStatus()) {

            BigDecimal spentAmount =
                    safeAmount(
                            budget.getSpentAmount()
                    );

            BigDecimal limitAmount =
                    safeAmount(
                            budget.getLimitAmount()
                    );

            boolean over =
                    spentAmount.compareTo(limitAmount) > 0;

            String status = over
                    ? "<span style='color:#ef4444'>Melebihi limit</span>"
                    : "<span style='color:#10b981'>Aman</span>";

            budgetRows.append(
                    String.format(
                            """
                            <tr>
                                <td style='padding:6px 0'>
                                    %s %s
                                </td>
                                <td style='padding:6px 0;text-align:right'>
                                    %s / %s
                                </td>
                                <td style='padding:6px 0;text-align:right'>
                                    %s
                                </td>
                            </tr>
                            """,
                            budget.getCategory().getIcon(),
                            budget.getCategory().getName(),
                            formatRupiah(spentAmount),
                            formatRupiah(limitAmount),
                            status
                    )
            );
        }

        // =========================
        // BUDGET SECTION
        // =========================
        String budgetSection;

        if (budgetRows.isEmpty()) {
            budgetSection = "";
        } else {
            budgetSection =
                    """
                    <h3>Status Budget</h3>
                    <table style="width:100%%;border-collapse:collapse">
                        %s
                    </table>
                    """.formatted(budgetRows);
        }

        // =========================
        // FINAL HTML
        // =========================
        return String.format(
                """
                <html>
                <body>
                    <div style="
                        font-family:Arial,sans-serif;
                        max-width:600px;
                        margin:0 auto;
                        color:#1c1917;
                    ">

                        <h2 style="color:#7c3aed">
                            Laporan Keuangan - %s
                        </h2>

                        <p>
                            Halo %s, berikut ringkasan keuanganmu
                            untuk periode ini:
                        </p>

                        <table style="
                            width:100%%;
                            border-collapse:collapse;
                            margin:16px 0;
                        ">
                            <tr>
                                <td style="padding:6px 0">
                                    Total Pemasukan
                                </td>

                                <td style="
                                    padding:6px 0;
                                    text-align:right;
                                    color:#10b981;
                                    font-weight:bold;
                                ">
                                    %s
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0">
                                    Total Pengeluaran
                                </td>

                                <td style="
                                    padding:6px 0;
                                    text-align:right;
                                    color:#ef4444;
                                    font-weight:bold;
                                ">
                                    %s
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0">
                                    Pengeluaran Periode Sebelumnya
                                </td>

                                <td style="
                                    padding:6px 0;
                                    text-align:right;
                                ">
                                    %s
                                </td>
                            </tr>
                        </table>

                        <h3>
                            Pengeluaran per Kategori
                        </h3>

                        <table style="
                            width:100%%;
                            border-collapse:collapse;
                        ">
                            %s
                        </table>

                        %s

                        <p style="
                            margin-top:24px;
                            font-size:12px;
                            color:#78716c;
                        ">
                            Dibuat otomatis oleh Finance AI.
                        </p>

                    </div>
                </body>
                </html>
                """,
                periodLabel,
                fullName,
                formatRupiah(report.getTotalIncome()),
                formatRupiah(report.getTotalExpense()),
                formatRupiah(
                        report.getPreviousMonthExpense()
                ),
                categoryRows,
                budgetSection
        );
    }

    /**
     * Membuat label periode.
     *
     * Contoh:
     * September 2026
     * Tahun 2026
     * 1 Sep 2026 - 15 Sep 2026
     */
    private String formatPeriodLabel(
            LocalDate start,
            LocalDate end
    ) {
        Locale idLocale =
                new Locale("id", "ID");

        DateTimeFormatter monthFormatter =
                DateTimeFormatter.ofPattern(
                        "MMMM yyyy",
                        idLocale
                );

        // =========================
        // FULL MONTH
        // =========================
        boolean isFullMonth =
                start.getDayOfMonth() == 1
                        && end.equals(
                        YearMonth
                                .from(start)
                                .atEndOfMonth()
                )
                        && YearMonth
                        .from(start)
                        .equals(
                                YearMonth.from(end)
                        );

        if (isFullMonth) {
            return start.format(monthFormatter);
        }

        // =========================
        // FULL YEAR
        // =========================
        boolean isFullYear =
                start.getDayOfYear() == 1
                        && end.getMonthValue() == 12
                        && end.getDayOfMonth() == 31
                        && start.getYear() == end.getYear();

        if (isFullYear) {
            return "Tahun " + start.getYear();
        }

        // =========================
        // CUSTOM RANGE
        // =========================
        DateTimeFormatter dateFormatter =
                DateTimeFormatter.ofPattern(
                        "d MMM yyyy",
                        idLocale
                );

        return start.format(dateFormatter)
                + " - "
                + end.format(dateFormatter);
    }

    /**
     * Format nominal menjadi Rupiah.
     */
    private String formatRupiah(BigDecimal amount) {
        amount = safeAmount(amount);

        return "Rp "
                + String.format(
                        "%,.0f",
                        amount
                ).replace(",", ".");
    }

    /**
     * Mencegah NullPointerException
     * ketika repository mengembalikan null.
     */
    private BigDecimal safeAmount(BigDecimal amount) {
        return amount != null
                ? amount
                : BigDecimal.ZERO;
    }

    /**
     * Validasi rentang tanggal.
     */
    private void validateDateRange(
            LocalDate start,
            LocalDate end
    ) {
        if (start == null || end == null) {
            throw new IllegalArgumentException(
                    "Tanggal mulai dan tanggal akhir wajib diisi"
            );
        }

        if (start.isAfter(end)) {
            throw new IllegalArgumentException(
                    "Tanggal mulai tidak boleh setelah tanggal akhir"
            );
        }
    }

    /**
     * Mencari user berdasarkan email.
     */
    private User findUser(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User tidak ditemukan"
                        )
                );
    }
}