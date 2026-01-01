// CategoryService.java - 完整修复版

package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.dto.request.CategoryRequest;
import com.jason.personalmoneyflow.model.dto.response.CategoryResponse;
import com.jason.personalmoneyflow.model.entity.CustomCategory;
import com.jason.personalmoneyflow.repository.CustomCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CustomCategoryRepository categoryRepository;

    public List<CategoryResponse> getCategoriesByUser(Long userId) {
        List<CustomCategory> categories = categoryRepository.findByUserId(userId);
        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        CustomCategory category = CustomCategory.builder()
                .userId(userId)
                .categoryType(request.getCategoryType())
                .categoryName(request.getCategoryName())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(false)
                .build();

        CustomCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long userId, Long categoryId, CategoryRequest request) {
        CustomCategory category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setCategoryName(request.getCategoryName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        CustomCategory updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        CustomCategory category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot delete default category");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(CustomCategory category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .categoryType(category.getCategoryType())
                .categoryName(category.getCategoryName())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .build();
    }
    
    @Transactional
    public void initializeDefaultCategories(Long userId) {
        List<CustomCategory> existing = categoryRepository.findByUserId(userId);
        if (!existing.isEmpty()) {
            return;
        }

        List<CustomCategory> defaultCategories = List.of(
            createDefaultCategory(userId, "INCOME", "Salary"),
            createDefaultCategory(userId, "INCOME", "Side Hustle"),
            createDefaultCategory(userId, "INCOME", "Rebate"),
            createDefaultCategory(userId, "EXPENSE", "Dining Out"),
            createDefaultCategory(userId, "EXPENSE", "Groceries"),
            createDefaultCategory(userId, "EXPENSE", "Transportation"),
            createDefaultCategory(userId, "EXPENSE", "Entertainment"),
            createDefaultCategory(userId, "EXPENSE", "Healthcare"),
            createDefaultCategory(userId, "EXPENSE", "Shopping"),
            createDefaultCategory(userId, "EXPENSE", "Education"),
            createDefaultCategory(userId, "EXPENSE", "Utilities")
        );

        categoryRepository.saveAll(defaultCategories);
    }

    private CustomCategory createDefaultCategory(Long userId, String type, String name) {
        return CustomCategory.builder()
                .userId(userId)
                .categoryType(type)
                .categoryName(name)
                .isDefault(true)
                .build();
    }
}
