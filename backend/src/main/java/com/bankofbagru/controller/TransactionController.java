package com.bankofbagru.controller;

import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.dto.DepositRequest;
import com.bankofbagru.dto.TransferRequest;
import com.bankofbagru.dto.WithdrawalRequest;
import com.bankofbagru.entity.BankTransaction;
import com.bankofbagru.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<BankTransaction>> deposit(@Valid @RequestBody DepositRequest request) {
        BankTransaction txn = transactionService.deposit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(txn, "Deposit of ₹" + request.getAmount() + " processed successfully."));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<BankTransaction>> withdraw(@Valid @RequestBody WithdrawalRequest request) {
        BankTransaction txn = transactionService.withdraw(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(txn, "Withdrawal of ₹" + request.getAmount() + " processed successfully."));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> transfer(@Valid @RequestBody TransferRequest request) {
        Map<String, Object> receipt = transactionService.transfer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(receipt, "Fund transfer completed successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankTransaction>>> getTransactions(
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        List<BankTransaction> txns = transactionService.searchTransactions(accountId, type, status, startDateTime, endDateTime);
        return ResponseEntity.ok(ApiResponse.success(txns, "Transactions retrieved successfully"));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<List<BankTransaction>>> getAccountTransactions(@PathVariable Integer accountId) {
        List<BankTransaction> txns = transactionService.getTransactionsByAccountId(accountId);
        return ResponseEntity.ok(ApiResponse.success(txns, "Account transaction history retrieved"));
    }
}
