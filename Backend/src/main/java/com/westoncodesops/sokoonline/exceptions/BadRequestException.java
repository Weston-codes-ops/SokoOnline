package com.westoncodesops.sokoonline.exceptions;

/**
 * Thrown when the request is invalid due to business rule violations.
 * e.g. Email already in use, Insufficient stock, Empty cart checkout
 * Maps to HTTP 400
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
