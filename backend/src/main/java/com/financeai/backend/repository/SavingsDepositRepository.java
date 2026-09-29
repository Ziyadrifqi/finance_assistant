package com.financeai.backend.repository;

import com.financeai.backend.dto.SourceAmountResponse;
import com.financeai.backend.entity.PaymentSource;
import com.financeai.backend.entity.SavingsDeposit;
import com.financeai.backend.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavingsDepositRepository extends JpaRepository<SavingsDeposit, Long> {

    @Query("SELECT new com.financeai.backend.dto.SourceAmountResponse(s.id, s.name, s.type, s.color, SUM(d.amount)) " +
           "FROM SavingsDeposit d JOIN d.paymentSource s " +
           "WHERE d.goal = :goal " +
           "GROUP BY s.id, s.name, s.type, s.color " +
           "ORDER BY SUM(d.amount) DESC")
    List<SourceAmountResponse> sumBySource(@Param("goal") SavingsGoal goal);

    void deleteByGoal(SavingsGoal goal);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE SavingsDeposit d SET d.paymentSource = null WHERE d.paymentSource = :source")
    void clearPaymentSource(@Param("source") PaymentSource source);
}