package com.financeai.backend.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyResultDto {
    private Long id;
    private Double amount;
    private String categoryName;
    private String transactionDate;
    private Boolean isAnomaly;
    private String reason;
}