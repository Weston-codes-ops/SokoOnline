package com.westoncodesops.sokoonline.dtos.requests;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(

        @NotNull(message = "Shipping details are required")
        @Valid  // tells Spring to also validate the nested ShippingDetails fields
        ShippingDetails shipping,

        String paymentReference   ) {

}
