package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.Orders;
import com.westoncodesops.sokoonline.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders, Long> {

    // Customer: view their own orders, newest first (use Pageable with Sort)
    Page<Orders> findByUserId(Long userId, Pageable pageable);

    // Admin: filter all orders by status
    Page<Orders> findByStatus(OrderStatus status, Pageable pageable);

    // Fetch order with items + products in a single query — avoids N+1
    @Query("""
        SELECT o FROM Orders o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        WHERE o.id = :orderId
        """)
    Optional<Orders> findByIdWithItems(@Param("orderId") Long orderId);

    // Customer: their order detail (ensures they can only see their own orders)
    @Query("""
        SELECT o FROM Orders o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        WHERE o.id = :orderId AND o.user.id = :userId
        """)
    Optional<Orders> findByIdAndUserIdWithItems(
            @Param("orderId") Long orderId,
            @Param("userId") Long userId
    );


}
