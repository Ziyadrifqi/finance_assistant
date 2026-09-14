package com.financeai.backend.controller;

import com.financeai.backend.dto.ReceiptScanResponse;
import com.financeai.backend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping(value = "/scan", consumes = "multipart/form-data")
    public ResponseEntity<ReceiptScanResponse> scan(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(receiptService.scanReceipt(file));
    }
}