package com.financeai.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Kategori wajib dipilih")
    private Long categoryId;

    @NotNull(message = "Limit anggaran wajib diisi")
    @DecimalMin(value = "0.01", message = "Limit harus lebih dari 0")
    private BigDecimal limitAmount;

    @NotNull(message = "Bulan wajib diisi")
    @Min(1) @Max(12)
    private Integer month;

    @NotNull(message = "Tahun wajib diisi")
    private Integer year;
}