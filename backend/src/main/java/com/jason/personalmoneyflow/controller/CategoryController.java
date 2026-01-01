// CategoryController.java - 临时允许公开访问

package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.CategoryRequest;
import com.jason.personalmoneyflow.model.dto.response.CategoryResponse;
import com.jason.personalmoneyflow.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // 添加 CORS
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        // 临时硬编码 user_id = 1
        Long userId = 1L;
        List<CategoryResponse> categories = categoryService.getCategoriesByUser(userId);
        System.out.println("Categories loaded: " + categories.size()); // 调试日志
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        Long userId = 1L;
        CategoryResponse category = categoryService.createCategory(userId, request);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {
        Long userId = 1L;
        CategoryResponse category = categoryService.updateCategory(userId, id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Long userId = 1L;
        categoryService.deleteCategory(userId, id);
        return ResponseEntity.noContent().build();
    }
}
