package com.westoncodesops.sokoonline.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/sokoonline}")
    private String springDataSourceUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String password;

    @Bean
    public DataSource dataSource() {
        String url = databaseUrl.isEmpty() ? springDataSourceUrl : databaseUrl;
        
        // Add jdbc: prefix if missing (for Railway's DATABASE_URL format: postgresql://...)
        if (url.startsWith("postgresql://")) {
            url = "jdbc:" + url;
        }

        DataSourceBuilder<?> builder = DataSourceBuilder.create()
                .url(url)
                .driverClassName("org.postgresql.Driver");

        // Only set username/password if provided (Railway's DATABASE_URL includes them in the URL)
        if (username != null && !username.isEmpty()) {
            builder.username(username);
        }
        if (password != null && !password.isEmpty()) {
            builder.password(password);
        }

        return builder.build();
    }
}
