package com.westoncodesops.sokoonline.services.OrderServices;

import com.westoncodesops.sokoonline.entities.OrderItems;
import com.westoncodesops.sokoonline.entities.Orders;
import com.westoncodesops.sokoonline.entities.Product;
import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.OrderStatus;
import com.westoncodesops.sokoonline.repositories.OrderRepository;
import com.westoncodesops.sokoonline.repositories.ProductRepository;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import com.westoncodesops.sokoonline.dtos.requests.CheckoutRequest;
import com.westoncodesops.sokoonline.dtos.requests.ShippingDetails;
import com.westoncodesops.sokoonline.dtos.response.CartResponse;
import com.westoncodesops.sokoonline.dtos.response.OrderItemResponse;
import com.westoncodesops.sokoonline.dtos.response.OrderResponse;
import com.westoncodesops.sokoonline.services.CartService.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderServiceInterface {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Override
    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        CartResponse cartResponse = cartService.getCart(userId);
        if (cartResponse.items().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart.");
        }

        // Validate stock, deduct, and build order items
        List<OrderItems> orderItems = cartResponse.items().stream().map(cartItem -> {
            Product product = productRepository.findById(cartItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.productId()));

            if (product.getStockQuantity() < cartItem.quantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for: " + product.getName() +
                                ". Available: " + product.getStockQuantity()
                );
            }

            product.setStockQuantity(product.getStockQuantity() - cartItem.quantity());
            productRepository.save(product);

            BigDecimal subtotal = cartItem.unitPrice().multiply(BigDecimal.valueOf(cartItem.quantity()));

            return OrderItems.builder()
                    .product(product)
                    .quantity(cartItem.quantity())
                    .priceAtPurchase(cartItem.unitPrice())
                    .subtotal(subtotal)
                    .productNameSnapshot(product.getName())
                    .build();
        }).toList();

        ShippingDetails s = request.shipping();

        Orders order = Orders.builder()
                .user(user)
                .customerEmail(user.getEmail())
                .totalAmount(cartResponse.total())
                .status(OrderStatus.PENDING)
                .shippingName(s.name())
                .shippingPhone(s.phone())
                .shippingAddressLine1(s.addressLine1())
                .shippingAddressLine2(s.addressLine2())
                .shippingCity(s.city())
                .shippingCountry(s.country())
                .shippingPostalCode(s.postalCode())
                .paymentReference(request.paymentReference())
                .items(orderItems)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        orderRepository.save(order);

        cartService.clearCart(userId);

        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersForUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Long orderId, Long userId) {
        Orders order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot update a " + order.getStatus() + " order.");
        }

        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    // --- Mapper ---

    private OrderResponse toResponse(Orders o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProductNameSnapshot(),
                        i.getQuantity(),
                        i.getPriceAtPurchase(),
                        i.getSubtotal()
                ))
                .toList();

        ShippingDetails shipping = new ShippingDetails(
                o.getShippingName(), o.getShippingPhone(),
                o.getShippingAddressLine1(), o.getShippingAddressLine2(),
                o.getShippingCity(), o.getShippingCountry(), o.getShippingPostalCode()
        );

        return new OrderResponse(
                o.getId(), o.getStatus().name(), o.getTotalAmount(),
                o.getCustomerEmail(), shipping, items,
                o.getCreatedAt().toString()
        );
    }
}
