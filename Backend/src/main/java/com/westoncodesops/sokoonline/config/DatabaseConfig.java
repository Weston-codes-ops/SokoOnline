package com.westoncodesops.sokoonline.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

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
    public DataSource dataSource() throws URISyntaxException {
        String url = databaseUrl.isEmpty() ? springDataSourceUrl : databaseUrl;

        // If using Railway's DATABASE_URL format: postgresql://user:pass@host:port/db
        if (url.startsWith("postgresql://")) {
            // Parse the URI to extract username, password, host, port, database
            URI dbUri = new URI(url);
            String userInfo = dbUri.getUserInfo();
            String[] userInfoParts = userInfo.split(":");
            String dbUsername = userInfoParts[0];
            String dbPassword = userInfoParts[1];

            // Build the JDBC URL
            String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();

            // Configure HikariCP directly
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(dbUsername);
            config.setPassword(dbPassword);
            config.setDriverClassName("org.postgresql.Driver");
            config.setMaximumPoolSize(5);
            config.setMinimumIdle(2);
            config.setIdleTimeout(300000);
            config.setMaxLifetime(600000);
            config.setConnectionTimeout(30000);
            config.setConnectionTestQuery("SELECT 1");

            return new HikariDataSource(config);
        } else {
            // Fall back to standard DataSourceBuilder for local development
            var builder = DataSourceBuilder.create()
                    .url(url)
                    .driverClassName("org.postgresql.Driver");

            if (username != null && !username.isEmpty()) {
                builder.username(username);
            }
            if (password != null && !password.isEmpty()) {
                builder.password(password);
            }

            return builder.build();
        }
    }
}
