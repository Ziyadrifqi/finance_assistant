package com.financeai.backend.service;

import com.financeai.backend.dto.BudgetRequest;
import com.financeai.backend.dto.BudgetResponse;
import com.financeai.backend.dto.CategoryResponse;
import com.financeai.backend.entity.Budget;
import com.financeai.backend.entity.Category;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.BudgetRepository;
import com.financeai.backend.repository.CategoryRepository;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<BudgetResponse> getByMonth(String email, Integer month, Integer year) {
        User user = findUser(email);
        return budgetRepository.findByUserAndMonthAndYear(user, month, year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BudgetResponse create(String email, BudgetRequest request) {
        User user = findUser(email);
        Category category = findCategory(request.getCategoryId(), user);

        if (budgetRepository.existsByCategoryIdAndMonthAndYearAndUser(
                request.getCategoryId(), request.getMonth(), request.getYear(), user)) {
            throw new IllegalArgumentException("Budget untuk kategori ini di bulan tersebut sudah ada");
        }

        Budget budget = Budget.builder()
                .category(category)
                .limitAmount(request.getLimitAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .user(user)
                .build();

        budgetRepository.save(budget);
        return toResponse(budget);
    }

    public BudgetResponse update(String email, Long id, BudgetRequest request) {
        User user = findUser(email);
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Budget tidak ditemukan"));

        Category category = findCategory(request.getCategoryId(), user);

        budget.setCategory(category);
        budget.setLimitAmount(request.getLimitAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        budgetRepository.save(budget);
        return toResponse(budget);
    }

    public void delete(String email, Long id) {
        User user = findUser(email);
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Budget tidak ditemukan"));
        budgetRepository.delete(budget);
    }

    private Category findCategory(Long categoryId, User user) {
        return categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private BudgetResponse toResponse(Budget budget) {
        YearMonth ym = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        var spent = transactionRepository.sumByUserAndCategoryAndDateRange(
                budget.getUser(), budget.getCategory().getId(), start, end);

        Category category = budget.getCategory();
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(CategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .type(category.getType())
                        .icon(category.getIcon())
                        .color(category.getColor())
                        .build())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spent)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}