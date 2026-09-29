package com.financeai.backend.dto;

import com.financeai.backend.entity.PaymentSourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentSourceRequest {

    @NotBlank(message = "Nama sumber dana wajib diisi")
    private String name;

    @NotNull(message = "Tipe sumber dana wajib diisi")
    private PaymentSourceType type;

    @NotBlank(message = "Warna wajib diisi")
    private String color;
}