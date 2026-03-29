package com.westoncodesops.sokoonline.services.OrderServices;

import com.westoncodesops.sokoonline.enums.OrderStatus;
import com.westoncodesops.sokoonline.dtos.requests.CheckoutRequest;
import com.westoncodesops.sokoonline.dtos.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderServiceInterface {

    OrderResponse checkout(Long userId, CheckoutRequest request);

    Page<OrderResponse> getOrdersForUser(Long userId, Pageable pageable);

    OrderResponse getOrderDetail(Long orderId, Long userId);

    OrderResponse updateStatus(Long orderId, OrderStatus newStatus);


}
