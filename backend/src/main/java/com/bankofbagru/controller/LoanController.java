package com.bankofbagru.controller;

import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.dto.LoanApplicationRequest;
import com.bankofbagru.entity.Loan;
import com.bankofbagru.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Loan>>> getLoans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String loanType,
            @RequestParam(required = false) Integer branchId) {

        List<Loan> loans;
        if (search != null && !search.trim().isEmpty()) {
            loans = loanService.searchLoans(search);
        } else if (status != null || loanType != null || branchId != null) {
            loans = loanService.filterLoans(status, loanType, branchId);
        } else {
            loans = loanService.getAllLoans();
        }
        return ResponseEntity.ok(ApiResponse.success(loans, "Loans retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Loan>> getLoanById(@PathVariable Integer id) {
        Loan loan = loanService.getLoanById(id);
        return ResponseEntity.ok(ApiResponse.success(loan, "Loan details retrieved successfully"));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Loan>> applyLoan(@Valid @RequestBody LoanApplicationRequest request) {
        Loan loan = loanService.applyLoan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(loan, "Loan application submitted successfully (Pending Approval)."));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Loan>> approveLoan(@PathVariable Integer id) {
        Loan approved = loanService.approveLoan(id);
        return ResponseEntity.ok(ApiResponse.success(approved, "Loan application approved successfully."));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Loan>> rejectLoan(@PathVariable Integer id) {
        Loan rejected = loanService.rejectLoan(id);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Loan application rejected."));
    }

    @PostMapping("/{id}/repay")
    public ResponseEntity<ApiResponse<Loan>> repayLoan(
            @PathVariable Integer id,
            @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        Loan repaid = loanService.repayLoan(id, amount);
        return ResponseEntity.ok(ApiResponse.success(repaid, "Loan repayment of ₹" + amount + " applied successfully."));
    }
}
