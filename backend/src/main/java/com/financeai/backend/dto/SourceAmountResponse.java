package com.financeai.backend.dto;

import com.financeai.backend.entity.PaymentSourceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Total nominal per sumber dana. Dipakai untuk rincian di budget & target tabungan.
 * Urutan field harus sama dengan constructor expression di repository.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SourceAmountResponse {
    private Long id;
    private String name;
    private PaymentSourceType type;
    private String color;
    private BigDecimal total;

    public static SourceAmountResponse unassigned(BigDecimal total) {
        return new SourceAmountResponse(null, "Tanpa sumber", null, "#a8a29e", total);
    }
}