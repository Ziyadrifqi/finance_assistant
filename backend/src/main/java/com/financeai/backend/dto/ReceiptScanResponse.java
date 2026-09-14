package com.financeai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptScanResponse {
    private String receiptImageUrl;
    private Double detectedAmount;
    private String detectedDate;
    private List<String> rawText;
}