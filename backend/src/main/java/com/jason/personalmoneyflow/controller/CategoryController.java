// CategoryController.java

package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.CategoryRequest;
import com.jason.personalmoneyflow.model.dto.response.CategoryResponse;
import com.jason.personalmoneyflow.service.CategoryService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @RequestParam(required = false) String type,
            HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<CategoryResponse> categories = (type != null && !type.isBlank())
                ? categoryService.getCategoriesByUserAndType(userId, type)
                : categoryService.getCategoriesByUser(userId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        CategoryResponse category = categoryService.getCategoryById(userId, id);
        return ResponseEntity.ok(category);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest categoryRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        CategoryResponse category = categoryService.createCategory(userId, categoryRequest);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest categoryRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        CategoryResponse category = categoryService.updateCategory(userId, id, categoryRequest);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        categoryService.deleteCategory(userId, id);
        return ResponseEntity.noContent().build();
    }
}
