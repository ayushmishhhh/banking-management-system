package com.bankofbagru;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class BankOfBagruApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankOfBagruApplication.class, args);
    }
}
