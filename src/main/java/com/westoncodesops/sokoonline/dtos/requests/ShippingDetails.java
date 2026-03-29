package com.westoncodesops.sokoonline.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ShippingDetails(
        @NotBlank(message = "Recipient name is required")
        String name,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number is invalid")
        String phone,

        @NotBlank(message = "Address line 1 is required")
        String addressLine1,

        String addressLine2,  // optional

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Country is required")
        String country,

        @Size(max = 20, message = "Postal code is too long")
        String postalCode
) {}
