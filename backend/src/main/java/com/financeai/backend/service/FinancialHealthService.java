package com.financeai.backend.service;

import com.financeai.backend.dto.BudgetResponse;
import com.financeai.backend.dto.HealthScoreResponse;
import com.financeai.backend.dto.ScoreComponentDto;
import com.financeai.backend.dto.SavingsGoalResponse;
import com.financeai.backend.entity.CategoryType;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialHealthService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final SavingsGoalService savingsGoalService;

    public HealthScoreResponse calculateScore(String email) {
        User user = findUser(email);
        YearMonth current = YearMonth.now();

        List<ScoreComponentDto> components = new ArrayList<>();
        int totalScore = 0;

        BigDecimal income = transactionRepository.sumByUserAndTypeAndDateRange(
                user, CategoryType.INCOME, current.atDay(1), current.atEndOfMonth());
        BigDecimal expense = transactionRepository.sumByUserAndTypeAndDateRange(
                user, CategoryType.EXPENSE, current.atDay(1), current.atEndOfMonth());

        int savingsScore;
        String savingsDesc;
        if (income.compareTo(BigDecimal.ZERO) == 0) {
            savingsScore = 0;
            savingsDesc = "Belum ada data pemasukan bulan ini";
        } else {
            double savingsRate = income.subtract(expense).divide(income, 4, java.math.RoundingMode.HALF_UP).doubleValue();
            savingsRate = Math.max(0, Math.min(1, savingsRate));
            savingsScore = (int) Math.round(savingsRate * 40);
            savingsDesc = String.format("Menyisihkan %.0f%% dari pemasukan bulan ini", savingsRate * 100);
        }
        components.add(ScoreComponentDto.builder()
                .name("Rasio Menabung").score(savingsScore).maxScore(40).description(savingsDesc).build());
        totalScore += savingsScore;

        List<BudgetResponse> budgets = budgetService.getByMonth(email, current.getMonthValue(), current.getYear());
        int budgetScore;
        String budgetDesc;
        if (budgets.isEmpty()) {
            budgetScore = 15;
            budgetDesc = "Belum ada budget yang diatur bulan ini";
        } else {
            long withinLimit = budgets.stream()
                    .filter(b -> b.getSpentAmount().compareTo(b.getLimitAmount()) <= 0)
                    .count();
            double ratio = (double) withinLimit / budgets.size();
            budgetScore = (int) Math.round(ratio * 30);
            budgetDesc = String.format("%d dari %d budget masih dalam limit", withinLimit, budgets.size());
        }
        components.add(ScoreComponentDto.builder()
                .name("Kepatuhan Budget").score(budgetScore).maxScore(30).description(budgetDesc).build());
        totalScore += budgetScore;

        BigDecimal threeMonthAvg = BigDecimal.ZERO;
        for (int i = 1; i <= 3; i++) {
            YearMonth ym = current.minusMonths(i);
            threeMonthAvg = threeMonthAvg.add(transactionRepository.sumByUserAndTypeAndDateRange(
                    user, CategoryType.EXPENSE, ym.atDay(1), ym.atEndOfMonth()));
        }
        threeMonthAvg = threeMonthAvg.divide(BigDecimal.valueOf(3), 2, java.math.RoundingMode.HALF_UP);

        int trendScore;
        String trendDesc;
        if (threeMonthAvg.compareTo(BigDecimal.ZERO) == 0) {
            trendScore = 10;
            trendDesc = "Belum cukup histori untuk membandingkan tren";
        } else if (expense.compareTo(threeMonthAvg) <= 0) {
            trendScore = 20;
            trendDesc = "Pengeluaran bulan ini stabil/lebih rendah dari rata-rata";
        } else {
            double increasePct = expense.subtract(threeMonthAvg)
                    .divide(threeMonthAvg, 4, java.math.RoundingMode.HALF_UP).doubleValue();
            trendScore = increasePct > 0.3 ? 0 : 10;
            trendDesc = String.format("Pengeluaran naik %.0f%% dari rata-rata 3 bulan terakhir", increasePct * 100);
        }
        components.add(ScoreComponentDto.builder()
                .name("Tren Pengeluaran").score(trendScore).maxScore(20).description(trendDesc).build());
        totalScore += trendScore;

        List<SavingsGoalResponse> goals = savingsGoalService.getAll(email);
        boolean hasActiveSaving = goals.stream()
                .anyMatch(g -> g.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0);
        int savingGoalScore = hasActiveSaving ? 10 : 0;
        String savingGoalDesc = hasActiveSaving
                ? "Ada target tabungan yang aktif diisi"
                : "Belum ada setoran ke target tabungan";
        components.add(ScoreComponentDto.builder()
                .name("Progres Tabungan").score(savingGoalScore).maxScore(10).description(savingGoalDesc).build());
        totalScore += savingGoalScore;

        String category;
        if (totalScore >= 80) category = "Sangat Sehat";
        else if (totalScore >= 60) category = "Sehat";
        else if (totalScore >= 40) category = "Perlu Perhatian";
        else category = "Waspada";

        return HealthScoreResponse.builder()
                .score(totalScore)
                .category(category)
                .components(components)
                .build();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }
}