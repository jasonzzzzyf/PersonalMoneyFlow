package com.jason.personalmoneyflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan(basePackages = "com.jason.personalmoneyflow.model.entity")
@EnableJpaRepositories(basePackages = "com.jason.personalmoneyflow.repository")
@EnableScheduling
public class MoneyFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneyFlowApplication.class, args);
    }
}
