package com.westoncodesops.sokoonline.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Promotion entity — represents a time-limited deal on a product.
 *
 * A promotion has:
 * - A linked product
 * - An optional badge label shown on the frontend (e.g. "50% OFF", "HOT DEAL")
 * - A discount percentage (0-100)
 * - A start and end date/time
 * - An active flag so admins can manually disable it
 *
 * The backend checks isActive() which returns true only if:
 * - active = true AND
 * - current time is between startDate and endDate
 */
@Entity
@Table(name = "promotions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The product this promotion applies to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Label shown on the product card e.g. "50% OFF", "NEW", "HOT DEAL"
    @Column(nullable = false)
    private String badge;

    // Discount percentage 0-100 (optional — purely informational for now)
    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercent;

    // Promotion window
    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    // Admin can manually toggle this off without deleting
    @Column(nullable = false)
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Returns true only if the promotion is active AND within its date window.
     * Use this in the service layer to filter valid promotions.
     */
    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        return active && now.isAfter(startDate) && now.isBefore(endDate);
    }
}
