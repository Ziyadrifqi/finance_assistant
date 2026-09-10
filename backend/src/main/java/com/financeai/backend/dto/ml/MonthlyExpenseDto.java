package com.financeai.backend.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyExpenseDto {
    private Integer month;
    private Integer year;
    private Double totalExpense;
}