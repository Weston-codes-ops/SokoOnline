package com.westoncodesops.sokoonline.dtos.response;

import java.math.BigDecimal;

 public record OrderItemResponse(
            String productName,
            Integer quantity,
            BigDecimal priceAtPurchase,
            BigDecimal subtotal
    ) {}


