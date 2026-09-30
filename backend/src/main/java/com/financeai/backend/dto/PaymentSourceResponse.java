package com.financeai.backend.dto;

import com.financeai.backend.entity.PaymentSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSourceResponse {
    private Long id;
    private String name;
    private PaymentSourceType type;
    private String color;
}