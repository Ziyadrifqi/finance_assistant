package com.financeai.backend.service;

import com.financeai.backend.dto.SavingsDepositRequest;
import com.financeai.backend.dto.SavingsGoalRequest;
import com.financeai.backend.dto.SavingsGoalResponse;
import com.financeai.backend.dto.SourceAmountResponse;
import com.financeai.backend.entity.PaymentSource;
import com.financeai.backend.entity.SavingsDeposit;
import com.financeai.backend.entity.SavingsGoal;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.PaymentSourceRepository;
import com.financeai.backend.repository.SavingsDepositRepository;
import com.financeai.backend.repository.SavingsGoalRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsDepositRepository savingsDepositRepository;
    private final PaymentSourceRepository paymentSourceRepository;
    private final UserRepository userRepository;

    public List<SavingsGoalResponse> getAll(String email) {
        User user = findUser(email);
        return savingsGoalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SavingsGoalResponse create(String email, SavingsGoalRequest request) {
        User user = findUser(email);
        SavingsGoal goal = SavingsGoal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .targetDate(request.getTargetDate())
                .currentAmount(BigDecimal.ZERO)
                .user(user)
                .build();
        savingsGoalRepository.save(goal);
        return toResponse(goal);
    }

    public SavingsGoalResponse update(String email, Long id, SavingsGoalRequest request) {
        User user = findUser(email);
        SavingsGoal goal = findGoal(id, user);

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());

        savingsGoalRepository.save(goal);
        return toResponse(goal);
    }

    @Transactional
    public SavingsGoalResponse deposit(String email, Long id, SavingsDepositRequest request) {
        User user = findUser(email);
        SavingsGoal goal = findGoal(id, user);

        PaymentSource source = null;
        if (request.getPaymentSourceId() != null) {
            source = paymentSourceRepository.findByIdAndUser(request.getPaymentSourceId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Sumber dana tidak ditemukan"));
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        savingsGoalRepository.save(goal);

        savingsDepositRepository.save(SavingsDeposit.builder()
                .goal(goal)
                .amount(request.getAmount())
                .paymentSource(source)
                .build());

        return toResponse(goal);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        SavingsGoal goal = findGoal(id, user);
        savingsDepositRepository.deleteByGoal(goal);
        savingsGoalRepository.delete(goal);
    }

    private SavingsGoal findGoal(Long id, User user) {
        return savingsGoalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Target tabungan tidak ditemukan"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private SavingsGoalResponse toResponse(SavingsGoal goal) {
        List<SourceAmountResponse> breakdown = new ArrayList<>(savingsDepositRepository.sumBySource(goal));

        // Saldo yang sudah ada sebelum fitur sumber dana muncul sebagai "Tanpa sumber"
        BigDecimal assigned = breakdown.stream()
                .map(SourceAmountResponse::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal unassigned = goal.getCurrentAmount().subtract(assigned);
        if (unassigned.signum() > 0) {
            breakdown.add(SourceAmountResponse.unassigned(unassigned));
        }

        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .sourceBreakdown(breakdown)
                .build();
    }
}