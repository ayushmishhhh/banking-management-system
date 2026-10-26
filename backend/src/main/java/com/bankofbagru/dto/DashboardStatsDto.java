package com.bankofbagru.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private Long totalCustomers;
    private Long totalAccounts;
    private BigDecimal totalBankBalance;
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private BigDecimal totalTransfers;
    private Long totalActiveLoans;
    private BigDecimal totalOutstandingLoanAmount;
    private Map<String, Long> accountDistribution; // e.g. Savings: 7, Current: 3, Fixed Deposit: 2
    private List<Map<String, Object>> monthlyTransactionSummary;
    private List<Map<String, Object>> recentTransactions;

    public DashboardStatsDto() {}

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(Long totalAccounts) {
        this.totalAccounts = totalAccounts;
    }

    public BigDecimal getTotalBankBalance() {
        return totalBankBalance;
    }

    public void setTotalBankBalance(BigDecimal totalBankBalance) {
        this.totalBankBalance = totalBankBalance;
    }

    public BigDecimal getTotalDeposits() {
        return totalDeposits;
    }

    public void setTotalDeposits(BigDecimal totalDeposits) {
        this.totalDeposits = totalDeposits;
    }

    public BigDecimal getTotalWithdrawals() {
        return totalWithdrawals;
    }

    public void setTotalWithdrawals(BigDecimal totalWithdrawals) {
        this.totalWithdrawals = totalWithdrawals;
    }

    public BigDecimal getTotalTransfers() {
        return totalTransfers;
    }

    public void setTotalTransfers(BigDecimal totalTransfers) {
        this.totalTransfers = totalTransfers;
    }

    public Long getTotalActiveLoans() {
        return totalActiveLoans;
    }

    public void setTotalActiveLoans(Long totalActiveLoans) {
        this.totalActiveLoans = totalActiveLoans;
    }

    public BigDecimal getTotalOutstandingLoanAmount() {
        return totalOutstandingLoanAmount;
    }

    public void setTotalOutstandingLoanAmount(BigDecimal totalOutstandingLoanAmount) {
        this.totalOutstandingLoanAmount = totalOutstandingLoanAmount;
    }

    public Map<String, Long> getAccountDistribution() {
        return accountDistribution;
    }

    public void setAccountDistribution(Map<String, Long> accountDistribution) {
        this.accountDistribution = accountDistribution;
    }

    public List<Map<String, Object>> getMonthlyTransactionSummary() {
        return monthlyTransactionSummary;
    }

    public void setMonthlyTransactionSummary(List<Map<String, Object>> monthlyTransactionSummary) {
        this.monthlyTransactionSummary = monthlyTransactionSummary;
    }

    public List<Map<String, Object>> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<Map<String, Object>> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
