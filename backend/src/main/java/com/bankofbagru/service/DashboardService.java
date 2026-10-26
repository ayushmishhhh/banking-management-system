package com.bankofbagru.service;

import com.bankofbagru.dto.DashboardStatsDto;
import com.bankofbagru.entity.BankTransaction;
import com.bankofbagru.repository.AccountRepository;
import com.bankofbagru.repository.BankTransactionRepository;
import com.bankofbagru.repository.CustomerRepository;
import com.bankofbagru.repository.LoanRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BankTransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final JdbcTemplate jdbcTemplate;

    public DashboardService(CustomerRepository customerRepository,
                            AccountRepository accountRepository,
                            BankTransactionRepository transactionRepository,
                            LoanRepository loanRepository,
                            JdbcTemplate jdbcTemplate) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardStatsDto getLiveDashboardStatistics() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // 1. Core aggregate statistics from MySQL
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalAccounts(accountRepository.count());
        stats.setTotalBankBalance(accountRepository.getTotalActiveBalance());
        stats.setTotalDeposits(transactionRepository.getTotalDeposits());
        stats.setTotalWithdrawals(transactionRepository.getTotalWithdrawals());
        stats.setTotalTransfers(transactionRepository.getTotalTransfers());
        stats.setTotalActiveLoans(loanRepository.countActiveLoans());
        stats.setTotalOutstandingLoanAmount(loanRepository.getTotalOutstandingLoanAmount());

        // 2. Account distribution by type (Savings, Current, Fixed Deposit)
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("Savings", 0L);
        distribution.put("Current", 0L);
        distribution.put("Fixed Deposit", 0L);

        List<Object[]> typeCounts = accountRepository.getAccountCountByType();
        for (Object[] row : typeCounts) {
            String type = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            distribution.put(type, count);
        }
        stats.setAccountDistribution(distribution);

        // 3. Monthly transaction summary (Grouped by month and type)
        String monthlySummarySql =
                "SELECT DATE_FORMAT(transaction_date, '%b %Y') AS month_label, " +
                "       transaction_type, " +
                "       SUM(amount) AS total_amount, " +
                "       COUNT(*) AS txn_count " +
                "FROM bank_transactions " +
                "WHERE transaction_status = 'Success' " +
                "GROUP BY DATE_FORMAT(transaction_date, '%b %Y'), " +
                "         DATE_FORMAT(transaction_date, '%Y-%m'), " +
                "         transaction_type " +
                "ORDER BY DATE_FORMAT(transaction_date, '%Y-%m') ASC";

        List<Map<String, Object>> monthlyList = jdbcTemplate.queryForList(monthlySummarySql);
        stats.setMonthlyTransactionSummary(monthlyList);

        // 4. Recent transactions list
        List<BankTransaction> recent = transactionRepository.findTop10ByOrderByTransactionDateDesc();
        List<Map<String, Object>> recentTxns = new ArrayList<>();
        for (BankTransaction t : recent) {
            Map<String, Object> map = new HashMap<>();
            map.put("transactionId", t.getTransactionId());
            map.put("reference", t.getTransactionReference());
            map.put("accountNumber", t.getAccount().getAccountNumber());
            map.put("customerName", t.getAccount().getCustomer().getFullName());
            map.put("transactionType", t.getTransactionType());
            map.put("amount", t.getAmount());
            map.put("date", t.getTransactionDate());
            map.put("description", t.getDescription());
            map.put("status", t.getTransactionStatus());
            recentTxns.add(map);
        }
        stats.setRecentTransactions(recentTxns);

        return stats;
    }
}
