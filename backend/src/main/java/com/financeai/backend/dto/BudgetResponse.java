package com.financeai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private CategoryResponse category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private Integer month;
    private Integer year;
}