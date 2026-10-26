package com.bankofbagru.repository;

import com.bankofbagru.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);

    List<Account> findByCustomerCustomerId(Integer customerId);
    List<Account> findByBranchBranchId(Integer branchId);
    List<Account> findByAccountStatus(String accountStatus);

    // Pessimistic Lock for concurrency protection during Transactions (Deposit/Withdrawal/Transfer)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountId = :id")
    Optional<Account> findByIdWithLock(@Param("id") Integer id);

    @Query("SELECT a FROM Account a WHERE " +
           "LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Account> searchAccounts(@Param("query") String query);

    @Query("SELECT a FROM Account a WHERE " +
           "(:accountType IS NULL OR a.accountType = :accountType) AND " +
           "(:branchId IS NULL OR a.branch.branchId = :branchId) AND " +
           "(:status IS NULL OR a.accountStatus = :status)")
    List<Account> filterAccounts(@Param("accountType") String accountType,
                                 @Param("branchId") Integer branchId,
                                 @Param("status") String status);

    // Aggregate queries for RDBMS demonstration
    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.accountStatus = 'Active'")
    BigDecimal getTotalActiveBalance();

    @Query("SELECT a.accountType, COUNT(a) FROM Account a GROUP BY a.accountType")
    List<Object[]> getAccountCountByType();

    long countByCustomerCustomerId(Integer customerId);
}
