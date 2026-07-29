package com.financeai.backend.repository;

import com.financeai.backend.entity.Transaction;
import com.financeai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByTransactionDateDescCreatedAtDesc(User user);
    Optional<Transaction> findByIdAndUser(Long id, User user);
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
            User user, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user = :user AND t.category.id = :categoryId " +
           "AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByUserAndCategoryAndDateRange(
            @Param("user") User user,
            @Param("categoryId") Long categoryId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}