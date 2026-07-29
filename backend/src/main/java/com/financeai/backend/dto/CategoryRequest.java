package com.financeai.backend.dto;

import com.financeai.backend.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Nama kategori wajib diisi")
    private String name;

    @NotNull(message = "Tipe kategori wajib diisi")
    private CategoryType type;

    @NotBlank(message = "Icon wajib diisi")
    private String icon;

    @NotBlank(message = "Warna wajib diisi")
    private String color;
}