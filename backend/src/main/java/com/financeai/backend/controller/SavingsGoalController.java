package com.financeai.backend.controller;

import com.financeai.backend.dto.SavingsDepositRequest;
import com.financeai.backend.dto.SavingsGoalRequest;
import com.financeai.backend.dto.SavingsGoalResponse;
import com.financeai.backend.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(savingsGoalService.getAll(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> create(
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(savingsGoalService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(savingsGoalService.update(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingsGoalResponse> deposit(
            @PathVariable Long id,
            @Valid @RequestBody SavingsDepositRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(savingsGoalService.deposit(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        savingsGoalService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}