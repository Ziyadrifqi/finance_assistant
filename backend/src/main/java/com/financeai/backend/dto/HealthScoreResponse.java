package com.financeai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthScoreResponse {
    private Integer score;
    private String category;
    private List<ScoreComponentDto> components;
}