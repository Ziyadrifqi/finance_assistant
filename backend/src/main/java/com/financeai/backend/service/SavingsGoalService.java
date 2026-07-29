package com.financeai.backend.service;

import com.financeai.backend.dto.SavingsDepositRequest;
import com.financeai.backend.dto.SavingsGoalRequest;
import com.financeai.backend.dto.SavingsGoalResponse;
import com.financeai.backend.entity.SavingsGoal;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.SavingsGoalRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
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

    public SavingsGoalResponse deposit(String email, Long id, SavingsDepositRequest request) {
        User user = findUser(email);
        SavingsGoal goal = findGoal(id, user);

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        savingsGoalRepository.save(goal);
        return toResponse(goal);
    }

    public void delete(String email, Long id) {
        User user = findUser(email);
        SavingsGoal goal = findGoal(id, user);
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
        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .build();
    }
}