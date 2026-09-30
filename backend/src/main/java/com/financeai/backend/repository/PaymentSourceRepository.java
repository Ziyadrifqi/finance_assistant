package com.financeai.backend.repository;

import com.financeai.backend.entity.PaymentSource;
import com.financeai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentSourceRepository extends JpaRepository<PaymentSource, Long> {
    List<PaymentSource> findByUserOrderByNameAsc(User user);
    Optional<PaymentSource> findByIdAndUser(Long id, User user);
    boolean existsByUserAndNameIgnoreCase(User user, String name);
    boolean existsByUserAndNameIgnoreCaseAndIdNot(User user, String name, Long id);
}