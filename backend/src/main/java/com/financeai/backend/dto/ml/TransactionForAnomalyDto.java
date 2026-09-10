package com.financeai.backend.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionForAnomalyDto {
    private Long id;
    private Double amount;
    private String categoryName;
    private String transactionDate;
}