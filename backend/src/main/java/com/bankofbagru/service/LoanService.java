package com.bankofbagru.service;

import com.bankofbagru.dto.LoanApplicationRequest;
import com.bankofbagru.entity.Branch;
import com.bankofbagru.entity.Customer;
import com.bankofbagru.entity.Loan;
import com.bankofbagru.exception.BankingBusinessException;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.BranchRepository;
import com.bankofbagru.repository.CustomerRepository;
import com.bankofbagru.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;

    public LoanService(LoanRepository loanRepository,
                       CustomerRepository customerRepository,
                       BranchRepository branchRepository) {
        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.branchRepository = branchRepository;
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(Integer id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + id));
    }

    public List<Loan> searchLoans(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllLoans();
        }
        return loanRepository.searchLoans(query.trim());
    }

    public List<Loan> filterLoans(String status, String loanType, Integer branchId) {
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;
        String cleanType = (loanType != null && !loanType.trim().isEmpty() && !loanType.equalsIgnoreCase("ALL")) ? loanType.trim() : null;
        Integer cleanBranch = (branchId != null && branchId > 0) ? branchId : null;

        return loanRepository.filterLoans(cleanStatus, cleanType, cleanBranch);
    }

    @Transactional
    public Loan applyLoan(LoanApplicationRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + request.getBranchId()));

        String type = request.getLoanType();
        if (!type.equals("Personal") && !type.equals("Home") && !type.equals("Education") && !type.equals("Vehicle")) {
            throw new BankingBusinessException("Invalid loan type: " + type + ". Must be Personal, Home, Education, or Vehicle.");
        }

        // Calculate total repayable = Principal + Simple Interest for tenure
        BigDecimal years = BigDecimal.valueOf(request.getTenureMonths()).divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        BigDecimal interest = request.getPrincipalAmount()
                .multiply(request.getInterestRate())
                .multiply(years)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal initialOutstanding = request.getPrincipalAmount().add(interest);

        Loan loan = new Loan(
                customer,
                branch,
                type,
                request.getPrincipalAmount(),
                request.getInterestRate(),
                request.getTenureMonths(),
                "Pending",
                initialOutstanding
        );

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan approveLoan(Integer loanId) {
        Loan loan = getLoanById(loanId);
        if (!"Pending".equalsIgnoreCase(loan.getLoanStatus())) {
            throw new BankingBusinessException("Only loans with 'Pending' status can be approved. Current status: " + loan.getLoanStatus());
        }
        loan.setLoanStatus("Approved");
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan rejectLoan(Integer loanId) {
        Loan loan = getLoanById(loanId);
        if (!"Pending".equalsIgnoreCase(loan.getLoanStatus())) {
            throw new BankingBusinessException("Only loans with 'Pending' status can be rejected. Current status: " + loan.getLoanStatus());
        }
        loan.setLoanStatus("Rejected");
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan repayLoan(Integer loanId, BigDecimal amount) {
        Loan loan = getLoanById(loanId);
        if (!"Approved".equalsIgnoreCase(loan.getLoanStatus())) {
            throw new BankingBusinessException("Cannot make repayments on loan that is not Active/Approved (Status: " + loan.getLoanStatus() + ").");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BankingBusinessException("Repayment amount must be greater than zero.");
        }

        BigDecimal newOutstanding = loan.getOutstandingAmount().subtract(amount);
        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            loan.setOutstandingAmount(BigDecimal.ZERO);
            loan.setLoanStatus("Closed");
        } else {
            loan.setOutstandingAmount(newOutstanding);
        }

        return loanRepository.save(loan);
    }
}
