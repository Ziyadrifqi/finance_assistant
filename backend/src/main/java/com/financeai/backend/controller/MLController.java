package com.financeai.backend.controller;

import com.financeai.backend.dto.ml.AnomalyResponseDto;
import com.financeai.backend.dto.ml.PredictionResultDto;
import com.financeai.backend.service.MLService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLService mlService;

    @GetMapping("/predict")
    public ResponseEntity<PredictionResultDto> predict(
            @RequestParam(defaultValue = "6") int monthsBack,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mlService.predictNextMonthExpense(authentication.getName(), monthsBack));
    }

    @GetMapping("/anomaly")
    public ResponseEntity<AnomalyResponseDto> anomaly(Authentication authentication) {
        return ResponseEntity.ok(mlService.detectAnomalies(authentication.getName()));
    }
}