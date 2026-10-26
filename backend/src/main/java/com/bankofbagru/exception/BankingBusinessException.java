package com.bankofbagru.exception;

public class BankingBusinessException extends RuntimeException {
    public BankingBusinessException(String message) {
        super(message);
    }
}
