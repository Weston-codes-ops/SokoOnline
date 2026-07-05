package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.SubcategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.SubcategoryResponse;
import com.westoncodesops.sokoonline.services.SubcategoryService.SubcategoryserviceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@RequiredArgsConstructor
public class SubcategoryController {

    private final SubcategoryserviceInterface subcategoryService;

    /** GET /api/subcategories — all subcategories */
    @GetMapping
    public ResponseEntity<List<SubcategoryResponse>> getAll() {
        return ResponseEntity.ok(subcategoryService.getAllSubcategories());
    }

    /** GET /api/subcategories?categoryId=1 — subcategories for a specific category */
    @GetMapping(params = "categoryId")
    public ResponseEntity<List<SubcategoryResponse>> getByCategory(@RequestParam Long categoryId) {
        return ResponseEntity.ok(subcategoryService.getSubcategoriesByCategory(categoryId));
    }

    /** POST /api/subcategories — admin only */
    @PostMapping
    public ResponseEntity<SubcategoryResponse> create(@Valid @RequestBody SubcategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subcategoryService.createSubcategory(request));
    }

    /** PUT /api/subcategories/{id} — admin only */
    @PutMapping("/{id}")
    public ResponseEntity<SubcategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SubcategoryRequest request) {
        return ResponseEntity.ok(subcategoryService.updateSubcategory(id, request));
    }

    /** DELETE /api/subcategories/{id} — admin only */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subcategoryService.deleteSubcategory(id);
        return ResponseEntity.noContent().build();
    }

}
