package com.westoncodesops.sokoonline.dtos.response;

import com.westoncodesops.sokoonline.dtos.requests.ShippingDetails;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        String status,
        BigDecimal totalAmount,
        String customerEmail,
        ShippingDetails shipping,
        List<OrderItemResponse> items,
        String createdAt
) {}
