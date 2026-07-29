package com.financeai.backend.repository;

import com.financeai.backend.entity.Budget;
import com.financeai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);
    Optional<Budget> findByIdAndUser(Long id, User user);
    boolean existsByCategoryIdAndMonthAndYearAndUser(Long categoryId, Integer month, Integer year, User user);
}