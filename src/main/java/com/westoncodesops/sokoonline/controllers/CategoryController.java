package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.CategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.CategoryResponse;
import com.westoncodesops.sokoonline.services.CategoryService.CategoryServiceInteface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;


@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryServiceInteface categoryService;

    /**
     * GET /api/categories
     * Public — anyone can browse categories
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * GET /api/categories/{slug}
     * Public — e.g. /api/categories/mens-shoes
     */
    @GetMapping("/{slug}")
    public ResponseEntity<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }

    /**
     * POST /api/categories
     * Admin only — enforce in security config
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(CREATED).body(categoryService.createCategory(request));
    }

    /**
     * PUT /api/categories/{id}
     * Admin only
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    /**
     * DELETE /api/categories/{id}
     * Admin only
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
