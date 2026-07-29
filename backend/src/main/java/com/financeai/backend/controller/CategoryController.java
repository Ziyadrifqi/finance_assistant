package com.financeai.backend.controller;

import com.financeai.backend.dto.CategoryRequest;
import com.financeai.backend.dto.CategoryResponse;
import com.financeai.backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(categoryService.getAll(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(categoryService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(categoryService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        categoryService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}