package com.westoncodesops.sokoonline.entities;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Builder
public class OrderItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * Price captured AT THE TIME of purchase.
     * Do NOT reference product.price here — prices change over time
     * and you must preserve what the customer actually paid.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase;

    // Convenience: subtotal = priceAtPurchase * quantity
    // Can be stored or computed — storing avoids repeated calculation
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // Snapshot the product name for historical record integrity
    @Column(nullable = false)
    private String productNameSnapshot;

}
