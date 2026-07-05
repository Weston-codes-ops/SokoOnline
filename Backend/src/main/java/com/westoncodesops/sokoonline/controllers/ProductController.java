package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.ProductRequest;
import com.westoncodesops.sokoonline.dtos.response.ProductResponse;
import com.westoncodesops.sokoonline.services.ProductService.ProductServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.CREATED;


@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductServiceInterface productService;

    /**
     * GET /api/products?page=0&size=20
     * GET /api/products?search=shoes&page=0&size=20
     * GET /api/products?categoryId=3&page=0&size=20
     * Public — browse and search the catalogue
     */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search, pageable));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageable));
        }
        return ResponseEntity.ok(productService.getAllActiveProducts(pageable));
    }

    /**
     * GET /api/products/{slug}
     * Public — product detail page e.g. /api/products/nike-air-max-90
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    /**
     * POST /api/products
     * Admin only
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(CREATED).body(productService.createProduct(request));
    }

    /**
     * PUT /api/products/{id}
     * Admin only
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /**
     * DELETE /api/products/{id}
     * Admin only — soft delists the product, does not physically delete
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delistProduct(@PathVariable Long id) {
        productService.delistProduct(id);
        return ResponseEntity.noContent().build();
    }
}
