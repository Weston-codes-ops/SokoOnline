package com.westoncodesops.sokoonline.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionResponse(
        Long id,
        Long productId,
        String name,
        String slug,
        String imageUrl,
        BigDecimal price,
        String categoryName,
        String badge,
        BigDecimal discountPercent,
        LocalDateTime endDate
) {}