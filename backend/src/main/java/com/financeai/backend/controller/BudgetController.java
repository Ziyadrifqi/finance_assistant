package com.financeai.backend.controller;

import com.financeai.backend.dto.BudgetRequest;
import com.financeai.backend.dto.BudgetResponse;
import com.financeai.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getByMonth(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        return ResponseEntity.ok(budgetService.getByMonth(authentication.getName(), month, year));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(budgetService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(budgetService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        budgetService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}