package com.financeai.backend.controller;

import com.financeai.backend.dto.HealthScoreResponse;
import com.financeai.backend.service.FinancialHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health-score")
@RequiredArgsConstructor
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;

    @GetMapping
    public ResponseEntity<HealthScoreResponse> getScore(Authentication authentication) {
        return ResponseEntity.ok(financialHealthService.calculateScore(authentication.getName()));
    }
}