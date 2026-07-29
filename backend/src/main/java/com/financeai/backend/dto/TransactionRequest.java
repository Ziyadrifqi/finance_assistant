package com.financeai.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotNull(message = "Jumlah wajib diisi")
    @DecimalMin(value = "0.01", message = "Jumlah harus lebih dari 0")
    private BigDecimal amount;

    private String note;

    @NotNull(message = "Tanggal wajib diisi")
    private LocalDate transactionDate;

    @NotNull(message = "Kategori wajib dipilih")
    private Long categoryId;
}