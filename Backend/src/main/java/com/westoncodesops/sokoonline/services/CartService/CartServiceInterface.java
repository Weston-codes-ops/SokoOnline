package com.westoncodesops.sokoonline.services.CartService;

import com.westoncodesops.sokoonline.dtos.response.CartResponse;

public interface CartServiceInterface {
    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, Long productId, int quantity);

    CartResponse updateItemQuantity(Long userId, Long productId, int quantity);

    void removeItem(Long userId, Long productId);

    void clearCart(Long userId);
}
