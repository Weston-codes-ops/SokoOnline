package com.westoncodesops.sokoonline.exceptions;

/**
 * Thrown when a requested resource doesn't exist.
 * e.g. Product not found, User not found, Order not found
 * Maps to HTTP 404
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
