package com.financeai.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SavingsDepositRequest {

    @NotNull(message = "Jumlah wajib diisi")
    @DecimalMin(value = "0.01", message = "Jumlah harus lebih dari 0")
    private BigDecimal amount;
}