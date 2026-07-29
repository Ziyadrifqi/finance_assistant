package com.financeai.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingsGoalRequest {

    @NotBlank(message = "Nama target wajib diisi")
    private String name;

    @NotNull(message = "Jumlah target wajib diisi")
    @DecimalMin(value = "0.01", message = "Jumlah target harus lebih dari 0")
    private BigDecimal targetAmount;

    private LocalDate targetDate;
}