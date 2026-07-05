package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.CheckoutRequest;
import com.westoncodesops.sokoonline.dtos.response.OrderResponse;
import com.westoncodesops.sokoonline.entities.Orders;
import com.westoncodesops.sokoonline.enums.OrderStatus;
import com.westoncodesops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodesops.sokoonline.repositories.OrderRepository;
import com.westoncodesops.sokoonline.services.OrderServices.OrderServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrderServiceInterface orderService;
    private final OrderRepository orderRepository;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    /**
     * POST /api/orders/checkout/{userId}
     * Customer places an order from their cart
     */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            Authentication auth,
             @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(getUserId(auth), request));
    }

    /**
     * GET /api/orders/user/{userId}?page=0&size=10
     * Customer views their own order history
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getOrdersForUser(getUserId(auth), pageable));
    }


  /** GET /api/orders/{orderId} */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(
            Authentication auth,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetail(orderId, getUserId(auth)));
    }

    /** PATCH /api/orders/{orderId}/status?status=SHIPPED — Admin only */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> getOrderStatus(
            @PathVariable Long id,
            Authentication auth) {
        Orders order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return ResponseEntity.ok(Map.of("status", order.getStatus().name()));
    }

}
