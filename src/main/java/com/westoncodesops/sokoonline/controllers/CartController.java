package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.response.CartResponse;
import com.westoncodesops.sokoonline.services.CartService.CartServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartServiceInterface cartService;


    /**
     * Helper: extract userId from the JWT token via Spring Security's Authentication object.
     * Remember in JwtAuthFilter we stored userId as the "credentials" field.
     * This means we NEVER trust a userId from the URL — it always comes from the token.
     */
    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    /**
     * GET /api/cart/{userId}
     * Returns the user's current cart with all items and total
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(getUserId(auth)));
    }

    /** POST /api/cart/items?productId=5&quantity=2 */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            Authentication auth,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.addItem(getUserId(auth), productId, quantity));
    }

    /** PATCH /api/cart/items/{productId}?quantity=3 */
    @PatchMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(
            Authentication auth,
            @PathVariable Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getUserId(auth), productId, quantity));
    }

    /** DELETE /api/cart/items/{productId} */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(Authentication auth, @PathVariable Long productId) {
        cartService.removeItem(getUserId(auth), productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/cart/{userId}
     * Clear the entire cart
     */
    /** DELETE /api/cart */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication auth) {
        cartService.clearCart(getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}
