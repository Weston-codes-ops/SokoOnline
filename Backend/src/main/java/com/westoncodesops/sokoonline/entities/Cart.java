package com.westoncodesops.sokoonline.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * One cart per user. OneToOne ensures the DB enforces this.
     * fetch = LAZY so we don't load the full User object just to access a cart.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * All items currently in this cart.
     * CascadeType.ALL means saving/deleting the Cart also saves/deletes its items.
     * orphanRemoval = true means removing an item from this list deletes it from the DB.
     */
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- Convenience methods ---

    /** Add a product to cart, or increase quantity if it already exists. */
    public void addItem(CartItem item) {
        items.stream()
                .filter(i -> i.getProduct().getId().equals(item.getProduct().getId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + item.getQuantity()),
                        () -> { item.setCart(this); items.add(item); }
                );
    }

    /** Remove an item by product ID. */
    public void removeItem(Long productId) {
        items.removeIf(i -> i.getProduct().getId().equals(productId));
    }

    /** Clear all items from the cart (called after order is placed). */
    public void clear() {
        items.clear();
    }
}


