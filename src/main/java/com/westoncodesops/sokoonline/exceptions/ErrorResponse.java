package com.westoncodesops.sokoonline.exceptions;

import java.time.LocalDateTime;

/**
 * The standard error shape returned by SokoOnline for every error.
 *
 * Instead of Spring's default ugly error page, every error returns:
 * {
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Product not found: 99",
 *   "timestamp": "2025-02-21T10:30:00"
 * }
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        LocalDateTime timestamp
) {
    // Convenience factory so handlers don't repeat boilerplate
    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(status, error, message, LocalDateTime.now());
    }
}
