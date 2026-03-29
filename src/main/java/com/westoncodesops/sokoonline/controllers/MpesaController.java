package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.enums.OrderStatus;
import com.westoncodesops.sokoonline.services.mpesa.Mpesaservice;
import com.westoncodesops.sokoonline.services.OrderServices.OrderServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mpesa")
@RequiredArgsConstructor
public class MpesaController {

    private final Mpesaservice mpesaService;
    private final OrderServiceInterface orderService;

    /**
     * POST /api/mpesa/stk-push
     * Called by frontend when customer clicks "Pay with M-Pesa"
     *
     * Request body: { phone, amount, orderId }
     * Returns: Safaricom's response with CheckoutRequestID
     */
    @PostMapping("/stk-push")
    public ResponseEntity<Map<String, Object>> stkPush(
            @RequestBody StkPushRequest request,
            Authentication auth) {
        Map<String, Object> response = mpesaService.initiateStkPush(
                request.phone(),
                request.amount(),
                request.orderId()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/mpesa/callback
     * Safaricom calls THIS endpoint after the customer pays or cancels.
     * Must be publicly accessible (no auth) and reachable from the internet.
     *
     * For local testing use ngrok:
     *   ngrok http 8080
     *   Then set mpesa.callback-url=https://YOUR_NGROK_URL/api/mpesa/callback
     */
    @PostMapping("/callback")
    public ResponseEntity<Void> callback(@RequestBody Map<String, Object> payload) {
        log.info("M-Pesa callback received: {}", payload);

        try {
            // Dig into Safaricom's nested response structure
            Map<String, Object> body = (Map<String, Object>)
                    payload.get("Body");
            Map<String, Object> stkCallback = (Map<String, Object>)
                    body.get("stkCallback");

            int resultCode = (int) stkCallback.get("ResultCode");
            String checkoutRequestId = (String) stkCallback.get("CheckoutRequestID");

            if (resultCode == 0) {
                // Payment successful — extract details
                Map<String, Object> metadata = (Map<String, Object>)
                        stkCallback.get("CallbackMetadata");

                // Extract order ID from AccountReference
                // AccountReference was set as "SokoOnline-{orderId}"
                String accountRef = getMetadataItem(metadata, "AccountReference");
                if (accountRef != null && accountRef.contains("-")) {
                    Long orderId = Long.parseLong(accountRef.split("-")[1]);
                    // Mark order as CONFIRMED
                    orderService.updateStatus(orderId, OrderStatus.CONFIRMED);
                    log.info("Order {} confirmed via M-Pesa", orderId);
                }
            } else {
                // Payment failed or cancelled
                String resultDesc = (String) stkCallback.get("ResultDesc");
                log.warn("M-Pesa payment failed: {}", resultDesc);
            }
        } catch (Exception e) {
            log.error("Error processing M-Pesa callback: {}", e.getMessage());
        }

        // Always return 200 to Safaricom — they retry if they get anything else
        return ResponseEntity.ok().build();
    }

    // Helper to extract a value from Safaricom's CallbackMetadata items array
    @SuppressWarnings("unchecked")
    private String getMetadataItem(Map<String, Object> metadata, String name) {
        if (metadata == null) return null;
        java.util.List<Map<String, Object>> items =
                (java.util.List<Map<String, Object>>) metadata.get("Item");
        if (items == null) return null;
        return items.stream()
                .filter(item -> name.equals(item.get("Name")))
                .map(item -> String.valueOf(item.get("Value")))
                .findFirst()
                .orElse(null);
    }

    public record StkPushRequest(String phone, int amount, Long orderId) {}
}
