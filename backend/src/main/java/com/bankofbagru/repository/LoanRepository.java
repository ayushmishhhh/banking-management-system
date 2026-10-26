package com.bankofbagru.repository;

import com.bankofbagru.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Integer> {

    List<Loan> findByCustomerCustomerId(Integer customerId);
    List<Loan> findByBranchBranchId(Integer branchId);
    List<Loan> findByLoanStatus(String loanStatus);

    @Query("SELECT l FROM Loan l WHERE " +
           "(:status IS NULL OR l.loanStatus = :status) AND " +
           "(:loanType IS NULL OR l.loanType = :loanType) AND " +
           "(:branchId IS NULL OR l.branch.branchId = :branchId)")
    List<Loan> filterLoans(@Param("status") String status,
                           @Param("loanType") String loanType,
                           @Param("branchId") Integer branchId);

    @Query("SELECT l FROM Loan l WHERE " +
           "CAST(l.loanId AS string) = :query OR " +
           "LOWER(l.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Loan> searchLoans(@Param("query") String query);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.loanStatus = 'Approved'")
    long countActiveLoans();

    @Query("SELECT COALESCE(SUM(l.outstandingAmount), 0) FROM Loan l WHERE l.loanStatus = 'Approved'")
    BigDecimal getTotalOutstandingLoanAmount();

    long countByCustomerCustomerIdAndLoanStatus(Integer customerId, String loanStatus);
}
