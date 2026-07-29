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
public class CategoryBreakdownResponse {
    private String categoryName;
    private String icon;
    private String color;
    private BigDecimal total;
}