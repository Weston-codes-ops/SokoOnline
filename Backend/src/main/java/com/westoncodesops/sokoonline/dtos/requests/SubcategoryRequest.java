package com.westoncodesops.sokoonline.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubcategoryRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotNull Long categoryId,
        String description
) {
}
