package com.financeai.backend.controller;

import com.financeai.backend.dto.TransactionRequest;
import com.financeai.backend.dto.TransactionResponse;
import com.financeai.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

   @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        if (month != null && year != null) {
            return ResponseEntity.ok(transactionService.getByMonth(authentication.getName(), month, year));
        }
        return ResponseEntity.ok(transactionService.getAll(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(transactionService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(transactionService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        transactionService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}