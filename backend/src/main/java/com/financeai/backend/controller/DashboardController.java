package com.financeai.backend.controller;

import com.financeai.backend.dto.CategoryBreakdownResponse;
import com.financeai.backend.dto.MonthlySummaryResponse;
import com.financeai.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/trend")
    public ResponseEntity<List<MonthlySummaryResponse>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int monthsBack,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dashboardService.getMonthlyTrend(authentication.getName(), monthsBack));
    }

    @GetMapping("/breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getExpenseBreakdown(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dashboardService.getExpenseBreakdown(authentication.getName(), month, year));
    }
}