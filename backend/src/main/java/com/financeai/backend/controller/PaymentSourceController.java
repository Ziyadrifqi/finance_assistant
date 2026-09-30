package com.financeai.backend.controller;

import com.financeai.backend.dto.PaymentSourceRequest;
import com.financeai.backend.dto.PaymentSourceResponse;
import com.financeai.backend.service.PaymentSourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-sources")
@RequiredArgsConstructor
public class PaymentSourceController {

    private final PaymentSourceService paymentSourceService;

    @GetMapping
    public ResponseEntity<List<PaymentSourceResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(paymentSourceService.getAll(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<PaymentSourceResponse> create(
            @Valid @RequestBody PaymentSourceRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(paymentSourceService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentSourceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PaymentSourceRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(paymentSourceService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        paymentSourceService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}