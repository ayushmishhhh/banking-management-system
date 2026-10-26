package com.bankofbagru.repository;

import com.bankofbagru.entity.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Integer> {

    List<BankTransaction> findByAccountAccountIdOrderByTransactionDateDesc(Integer accountId);

    List<BankTransaction> findTop10ByOrderByTransactionDateDesc();

    @Query("SELECT t FROM BankTransaction t WHERE " +
           "(:accountId IS NULL OR t.account.accountId = :accountId) AND " +
           "(:type IS NULL OR t.transactionType = :type) AND " +
           "(:status IS NULL OR t.transactionStatus = :status) AND " +
           "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "ORDER BY t.transactionDate DESC")
    List<BankTransaction> searchTransactions(@Param("accountId") Integer accountId,
                                            @Param("type") String type,
                                            @Param("status") String status,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    // Aggregate queries for transactions
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM BankTransaction t WHERE t.transactionType = 'Deposit' AND t.transactionStatus = 'Success'")
    BigDecimal getTotalDeposits();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM BankTransaction t WHERE t.transactionType = 'Withdrawal' AND t.transactionStatus = 'Success'")
    BigDecimal getTotalWithdrawals();

    // Since transfer records both debit and credit entries with amount, distinct transfer volume is sum / 2 or count distinct reference
    @Query("SELECT COALESCE(SUM(t.amount), 0) / 2 FROM BankTransaction t WHERE t.transactionType = 'Transfer' AND t.transactionStatus = 'Success'")
    BigDecimal getTotalTransfers();

    @Query("SELECT t FROM BankTransaction t WHERE t.account.accountId = :accountId " +
           "AND t.transactionDate BETWEEN :start AND :end " +
           "ORDER BY t.transactionDate ASC")
    List<BankTransaction> findAccountStatementTransactions(@Param("accountId") Integer accountId,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);

    @Query("SELECT t FROM BankTransaction t WHERE t.amount >= :threshold ORDER BY t.amount DESC")
    List<BankTransaction> findHighValueTransactions(@Param("threshold") BigDecimal threshold);
}
