package com.bankofbagru.service;

import com.bankofbagru.dto.AccountStatementDto;
import com.bankofbagru.entity.Account;
import com.bankofbagru.entity.BankTransaction;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.AccountRepository;
import com.bankofbagru.repository.BankTransactionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final AccountRepository accountRepository;
    private final BankTransactionRepository transactionRepository;
    private final JdbcTemplate jdbcTemplate;

    public ReportService(AccountRepository accountRepository,
                         BankTransactionRepository transactionRepository,
                         JdbcTemplate jdbcTemplate) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Generates an official Account Statement for an account within a date window.
     */
    public AccountStatementDto generateAccountStatement(Integer accountId, LocalDate startDate, LocalDate endDate) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(3);
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        List<BankTransaction> txns = transactionRepository.findAccountStatementTransactions(accountId, startDateTime, endDateTime);

        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        List<Map<String, Object>> lines = new ArrayList<>();
        for (BankTransaction t : txns) {
            Map<String, Object> line = new HashMap<>();
            line.put("reference", t.getTransactionReference());
            line.put("date", t.getTransactionDate());
            line.put("type", t.getTransactionType());
            line.put("description", t.getDescription());
            line.put("amount", t.getAmount());

            boolean isCredit = t.getTransactionType().equals("Deposit") ||
                    (t.getTransactionType().equals("Transfer") && t.getDescription().startsWith("Transfer from"));

            if (isCredit) {
                line.put("credit", t.getAmount());
                line.put("debit", BigDecimal.ZERO);
                totalCredits = totalCredits.add(t.getAmount());
            } else {
                line.put("debit", t.getAmount());
                line.put("credit", BigDecimal.ZERO);
                totalDebits = totalDebits.add(t.getAmount());
            }
            lines.add(line);
        }

        AccountStatementDto statement = new AccountStatementDto();
        statement.setAccountNumber(account.getAccountNumber());
        statement.setAccountType(account.getAccountType());
        statement.setCustomerName(account.getCustomer().getFullName());
        statement.setCustomerEmail(account.getCustomer().getEmail());
        statement.setCustomerPhone(account.getCustomer().getPhone());
        statement.setBranchName(account.getBranch().getBranchName());
        statement.setIfscCode(account.getBranch().getIfscCode());
        statement.setStartDate(startDateTime.toLocalDate());
        statement.setEndDate(endDateTime.toLocalDate());
        statement.setTotalDebits(totalDebits);
        statement.setTotalCredits(totalCredits);
        statement.setClosingBalance(account.getBalance());
        statement.setOpeningBalance(account.getBalance().subtract(totalCredits).add(totalDebits));
        statement.setStatementLines(lines);

        return statement;
    }

    /**
     * Branch-wise performance aggregation (JOINs across branches, accounts, and loans)
     */
    public List<Map<String, Object>> getBranchPerformanceReport() {
        String sql =
                "SELECT b.branch_id, b.branch_name, b.ifsc_code, b.city, " +
                "       COUNT(DISTINCT a.account_id) AS total_accounts, " +
                "       COALESCE(SUM(a.balance), 0) AS total_deposits_balance, " +
                "       COUNT(DISTINCT l.loan_id) AS total_loans, " +
                "       COALESCE(SUM(l.outstanding_amount), 0) AS total_loan_outstanding " +
                "FROM branches b " +
                "LEFT JOIN accounts a ON b.branch_id = a.branch_id AND a.account_status = 'Active' " +
                "LEFT JOIN loans l ON b.branch_id = l.branch_id AND l.loan_status = 'Approved' " +
                "GROUP BY b.branch_id, b.branch_name, b.ifsc_code, b.city " +
                "ORDER BY total_deposits_balance DESC";

        return jdbcTemplate.queryForList(sql);
    }

    /**
     * High-value transactions report (> ₹50,000)
     */
    public List<BankTransaction> getHighValueTransactions(BigDecimal threshold) {
        BigDecimal limit = threshold != null ? threshold : new BigDecimal("50000.00");
        return transactionRepository.findHighValueTransactions(limit);
    }

    /**
     * Loan portfolio status distribution
     */
    public List<Map<String, Object>> getLoanPortfolioSummary() {
        String sql =
                "SELECT loan_type, loan_status, COUNT(*) AS count, " +
                "       SUM(principal_amount) AS total_principal, " +
                "       SUM(outstanding_amount) AS total_outstanding, " +
                "       ROUND(AVG(interest_rate), 2) AS avg_interest_rate " +
                "FROM loans " +
                "GROUP BY loan_type, loan_status " +
                "ORDER BY loan_type, loan_status";

        return jdbcTemplate.queryForList(sql);
    }
}
