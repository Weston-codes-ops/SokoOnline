package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItems, Long> {

    // Useful for admin reporting: find all order lines for a specific product
    // e.g. "how many units of product X have been sold?"
    List<OrderItems> findByProductId(Long productId);


}
