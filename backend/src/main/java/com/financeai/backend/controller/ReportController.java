package com.financeai.backend.controller;

import com.financeai.backend.dto.ReportResponse;
import com.financeai.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponse> getReport(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reportService.getReport(authentication.getName(), month, year));
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendReportNow(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        reportService.sendReportEmail(authentication.getName(), month, year);
        return ResponseEntity.ok(Map.of("message", "Laporan telah dikirim ke email kamu"));
    }
}