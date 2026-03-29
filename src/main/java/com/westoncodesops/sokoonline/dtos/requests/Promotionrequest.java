package com.westoncodesops.sokoonline.dtos.requests;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PromotionRequest — what the admin sends when creating/editing a promo.
 */
public record Promotionrequest(

        @NotNull(message = "Product ID is required")
        Long productId,

        @NotBlank(message = "Badge label is required")
        String badge,

        @DecimalMin(value = "0") @DecimalMax(value = "100")
        BigDecimal discountPercent,

        @NotNull(message = "Start date is required")
        LocalDateTime startDate,

        @NotNull(message = "End date is required")
        LocalDateTime endDate,

        boolean active
) {}
