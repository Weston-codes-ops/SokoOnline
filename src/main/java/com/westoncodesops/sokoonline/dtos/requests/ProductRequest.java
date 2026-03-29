package com.westoncodesops.sokoonline.dtos.requests;

import jakarta.validation.constraints.*;


import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        String name,

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
        BigDecimal price,

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity,

        String imageUrl,

        @NotNull(message = "Category is required")
        Long categoryId,

        // Optional — product can belong to a subcategory
        Long subcategoryId
) {}
