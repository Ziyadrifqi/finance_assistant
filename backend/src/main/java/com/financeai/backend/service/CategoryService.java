package com.financeai.backend.service;

import com.financeai.backend.dto.CategoryRequest;
import com.financeai.backend.dto.CategoryResponse;
import com.financeai.backend.entity.Category;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.CategoryRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getAll(String email) {
        User user = findUser(email);
        return categoryRepository.findByUserOrderByNameAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse create(String email, CategoryRequest request) {
        User user = findUser(email);
        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .user(user)
                .build();
        categoryRepository.save(category);
        return toResponse(category);
    }

    public CategoryResponse update(String email, Long id, CategoryRequest request) {
        User user = findUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));

        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        categoryRepository.save(category);
        return toResponse(category);
    }

    public void delete(String email, Long id) {
        User user = findUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));
        categoryRepository.delete(category);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .build();
    }
}