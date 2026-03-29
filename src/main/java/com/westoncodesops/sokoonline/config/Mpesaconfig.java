package com.westoncodesops.sokoonline.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@ConfigurationProperties(prefix = "mpesa")
public class Mpesaconfig {
    private String consumerKey;
    private String consumerSecret;
    private String shortcode;
    private String passkey;
    private String callbackUrl;

    // Sandbox URLs — swap for production when going live
    public static final String AUTH_URL     = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    public static final String STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
}
