package com.westoncodesops.sokoonline.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PromotionResponse — what the frontend receives for each promo item.
 * Includes product info + promotion metadata.
 */
public record Promotionresponse(
        Long id,
        // Product fields
        Long productId,
        String name,
        String slug,
        String imageUrl,
        BigDecimal price,
        String categoryName,
        // Promotion fields
        String badge,
        BigDecimal discountPercent,
        LocalDateTime endDate      // Frontend can use this for a countdown timer later
) {}
