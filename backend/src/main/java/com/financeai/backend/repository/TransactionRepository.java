package com.financeai.backend.repository;

import com.financeai.backend.entity.Transaction;
import com.financeai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByTransactionDateDescCreatedAtDesc(User user);
    Optional<Transaction> findByIdAndUser(Long id, User user);
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
            User user, LocalDate start, LocalDate end);
}