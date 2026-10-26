package com.bankofbagru.controller;

import com.bankofbagru.dto.AccountDto;
import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAccounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) String status) {

        List<AccountDto> accounts;
        if (search != null && !search.trim().isEmpty()) {
            accounts = accountService.searchAccounts(search);
        } else if (type != null || branchId != null || status != null) {
            accounts = accountService.filterAccounts(type, branchId, status);
        } else {
            accounts = accountService.getAllAccounts();
        }
        return ResponseEntity.ok(ApiResponse.success(accounts, "Accounts retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountById(@PathVariable Integer id) {
        AccountDto account = accountService.getAccountById(id);
        return ResponseEntity.ok(ApiResponse.success(account, "Account details retrieved successfully"));
    }

    @GetMapping("/by-number/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountByNumber(@PathVariable String accountNumber) {
        AccountDto account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success(account, "Account details retrieved successfully"));
    }

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAccountsByCustomerId(@PathVariable Integer customerId) {
        List<AccountDto> accounts = accountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(accounts, "Customer accounts retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(@Valid @RequestBody AccountDto accountDto) {
        AccountDto created = accountService.createAccount(accountDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Bank account opened successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccountStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        AccountDto updated = accountService.updateAccountStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Account status updated to " + status));
    }
}
