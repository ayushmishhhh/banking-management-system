package com.bankofbagru.controller;

import com.bankofbagru.dto.AccountStatementDto;
import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.entity.BankTransaction;
import com.bankofbagru.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/statement/{accountId}")
    public ResponseEntity<ApiResponse<AccountStatementDto>> getAccountStatement(
            @PathVariable Integer accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        AccountStatementDto statement = reportService.generateAccountStatement(accountId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(statement, "Account statement generated successfully"));
    }

    @GetMapping("/branch-performance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBranchPerformanceReport() {
        List<Map<String, Object>> report = reportService.getBranchPerformanceReport();
        return ResponseEntity.ok(ApiResponse.success(report, "Branch performance report generated"));
    }

    @GetMapping("/high-value-transactions")
    public ResponseEntity<ApiResponse<List<BankTransaction>>> getHighValueTransactions(
            @RequestParam(required = false, defaultValue = "50000.00") BigDecimal threshold) {
        List<BankTransaction> txns = reportService.getHighValueTransactions(threshold);
        return ResponseEntity.ok(ApiResponse.success(txns, "High-value transactions report generated"));
    }

    @GetMapping("/loan-portfolio")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLoanPortfolioSummary() {
        List<Map<String, Object>> summary = reportService.getLoanPortfolioSummary();
        return ResponseEntity.ok(ApiResponse.success(summary, "Loan portfolio summary generated"));
    }
}
