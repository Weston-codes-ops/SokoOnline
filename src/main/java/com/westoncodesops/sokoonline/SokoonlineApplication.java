package com.westoncodesops.sokoonline;

import com.westoncodesops.sokoonline.config.Mpesaconfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;


@EnableConfigurationProperties(Mpesaconfig.class)
@SpringBootApplication
public class SokoonlineApplication {

	public static void main(String[] args) {
		SpringApplication.run(SokoonlineApplication.class, args);
	}

}
