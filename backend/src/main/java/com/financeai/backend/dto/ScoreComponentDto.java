package com.financeai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreComponentDto {
    private String name;
    private Integer score;
    private Integer maxScore;
    private String description;
}