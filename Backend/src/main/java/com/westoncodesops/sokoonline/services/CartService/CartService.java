package com.westoncodesops.sokoonline.services.CartService;

import com.westoncodesops.sokoonline.entities.Cart;
import com.westoncodesops.sokoonline.entities.CartItem;
import com.westoncodesops.sokoonline.entities.Product;
import com.westoncodesops.sokoonline.repositories.CartRepository;
import com.westoncodesops.sokoonline.repositories.ProductRepository;
import com.westoncodesops.sokoonline.dtos.response.CartItemResponse;
import com.westoncodesops.sokoonline.dtos.response.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService implements CartServiceInterface {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        return toResponse(getCartForUser(userId));
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, Long productId, int quantity) {
        Cart cart = getCartForUser(userId);
        Product product = getActiveProduct(productId);

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available: " + product.getStockQuantity()
            );
        }

        cart.addItem(CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(quantity)
                .build());

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long productId, int quantity) {
        Cart cart = getCartForUser(userId);

        if (quantity <= 0) {
            cart.removeItem(productId);
        } else {
            Product product = getActiveProduct(productId);
            if (product.getStockQuantity() < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock. Available: " + product.getStockQuantity()
                );
            }
            cart.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(productId))
                    .findFirst()
                    .ifPresent(i -> i.setQuantity(quantity));
        }

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public void removeItem(Long userId, Long productId) {
        Cart cart = getCartForUser(userId);
        cart.removeItem(productId);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartForUser(userId);
        cart.clear();
        cartRepository.save(cart);
    }

    // --- Helpers ---

    private Cart getCartForUser(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));
    }

    private Product getActiveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        if (!product.getActive()) {
            throw new IllegalArgumentException("Product is no longer available.");
        }
        return product;
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getProduct().getImageUrl(),
                        i.getProduct().getPrice(),
                        i.getQuantity(),
                        i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                ))
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, total);
    }
}
