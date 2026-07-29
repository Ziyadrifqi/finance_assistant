package com.financeai.backend.service;

import com.financeai.backend.dto.CategoryBreakdownResponse;
import com.financeai.backend.dto.MonthlySummaryResponse;
import com.financeai.backend.entity.Category;
import com.financeai.backend.entity.CategoryType;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.CategoryRepository;
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
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<MonthlySummaryResponse> getMonthlyTrend(String email, int monthsBack) {
        User user = findUser(email);
        List<MonthlySummaryResponse> result = new ArrayList<>();

        YearMonth current = YearMonth.now();
        for (int i = monthsBack - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            BigDecimal income = transactionRepository.sumByUserAndTypeAndDateRange(
                    user, CategoryType.INCOME, ym.atDay(1), ym.atEndOfMonth());
            BigDecimal expense = transactionRepository.sumByUserAndTypeAndDateRange(
                    user, CategoryType.EXPENSE, ym.atDay(1), ym.atEndOfMonth());

            result.add(MonthlySummaryResponse.builder()
                    .month(ym.getMonthValue())
                    .year(ym.getYear())
                    .totalIncome(income)
                    .totalExpense(expense)
                    .build());
        }

        return result;
    }

    public List<CategoryBreakdownResponse> getExpenseBreakdown(String email, Integer month, Integer year) {
        User user = findUser(email);
        YearMonth ym = YearMonth.of(year, month);

        List<Category> categories = categoryRepository.findByUserOrderByNameAsc(user)
                .stream()
                .filter(c -> c.getType() == CategoryType.EXPENSE)
                .toList();

        List<CategoryBreakdownResponse> result = new ArrayList<>();
        for (Category category : categories) {
            BigDecimal total = transactionRepository.sumByUserAndCategoryAndDateRange(
                    user, category.getId(), ym.atDay(1), ym.atEndOfMonth());

            if (total.compareTo(BigDecimal.ZERO) > 0) {
                result.add(CategoryBreakdownResponse.builder()
                        .categoryName(category.getName())
                        .icon(category.getIcon())
                        .color(category.getColor())
                        .total(total)
                        .build());
            }
        }

        return result;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }
}