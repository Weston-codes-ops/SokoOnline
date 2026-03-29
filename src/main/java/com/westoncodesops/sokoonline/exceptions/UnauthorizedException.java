package com.westoncodesops.sokoonline.exceptions;

/**
 * Thrown when a user tries to access a resource they don't own.
 * e.g. Customer trying to view another user's order
 * Maps to HTTP 403
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
