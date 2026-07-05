package com.westoncodesops.sokoonline.services.mpesa;

import com.westoncodesops.sokoonline.config.Mpesaconfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * MpesaService — handles all communication with Safaricom Daraja API
 *
 * TWO STEPS:
 * 1. getAccessToken()  — authenticates with Safaricom, gets a short-lived token
 * 2. initiateStkPush() — sends payment prompt to customer's phone
 *
 * The access token expires every hour so we fetch it fresh on each request.
 * In production you'd cache it and only refresh when it expires.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Mpesaservice {

    private final Mpesaconfig mpesaConfig;
    private final RestTemplate restTemplate;

    /**
     * Step 1 — Get OAuth access token from Safaricom.
     * We Base64-encode our Consumer Key + Secret and send it
     * as Basic Auth to Safaricom's auth endpoint.
     */
    public String getAccessToken() {
        // Base64 encode "consumerKey:consumerSecret"
        String credentials = mpesaConfig.getConsumerKey() + ":" + mpesaConfig.getConsumerSecret();
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                Mpesaconfig.AUTH_URL,
                HttpMethod.GET,
                entity,
                Map.class
        );

        return (String) response.getBody().get("access_token");
    }

    /**
     * Step 2 — Initiate STK Push (the payment prompt on the customer's phone).
     *
     * @param phone     Customer phone number e.g. "254712345678" (must start with 254)
     * @param amount    Amount in KES e.g. 1500
     * @param orderId   Your order ID — sent as the account reference
     *
     * Safaricom will call your callbackUrl with the payment result.
     */
    public Map<String, Object> initiateStkPush(String phone, int amount, Long orderId) {
        String accessToken = getAccessToken();

        // Timestamp format required by Safaricom: yyyyMMddHHmmss
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        /*
         * Password = Base64(Shortcode + Passkey + Timestamp)
         * This proves to Safaricom that the request is from us.
         */
        String rawPassword = mpesaConfig.getShortcode() + mpesaConfig.getPasskey() + timestamp;
        String password    = Base64.getEncoder().encodeToString(rawPassword.getBytes());

        // Normalize phone — strip leading 0 and add 254 if needed
        String normalizedPhone = normalizePhone(phone);

        Map<String, Object> body = new HashMap<>();
        body.put("BusinessShortCode", mpesaConfig.getShortcode());
        body.put("Password",          password);
        body.put("Timestamp",         timestamp);
        body.put("TransactionType",   "CustomerPayBillOnline");
        body.put("Amount",            amount);
        body.put("PartyA",            normalizedPhone);  // Customer phone
        body.put("PartyB",            mpesaConfig.getShortcode());
        body.put("PhoneNumber",       normalizedPhone);
        body.put("CallBackURL",       mpesaConfig.getCallbackUrl());
        body.put("AccountReference",  "SokoOnline-" + orderId);
        body.put("TransactionDesc",   "Payment for order #" + orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                Mpesaconfig.STK_PUSH_URL,
                HttpMethod.POST,
                entity,
                Map.class
        );

        log.info("STK Push response: {}", response.getBody());
        return response.getBody();
    }

    /**
     * Normalize phone to 254XXXXXXXXX format.
     * Handles: 0712345678 → 254712345678
     *          +254712345678 → 254712345678
     *          254712345678 → 254712345678 (already correct)
     */
    private String normalizePhone(String phone) {
        phone = phone.trim().replaceAll("\\s+", "");
        if (phone.startsWith("+")) phone = phone.substring(1);
        if (phone.startsWith("0"))  phone = "254" + phone.substring(1);
        return phone;
    }
}

