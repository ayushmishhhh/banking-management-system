package com.bankofbagru.service;

import com.bankofbagru.dto.AccountDto;
import com.bankofbagru.entity.Account;
import com.bankofbagru.entity.Branch;
import com.bankofbagru.entity.Customer;
import com.bankofbagru.exception.BankingBusinessException;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.AccountRepository;
import com.bankofbagru.repository.BranchRepository;
import com.bankofbagru.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AccountService(AccountRepository accountRepository,
                          CustomerRepository customerRepository,
                          BranchRepository branchRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.branchRepository = branchRepository;
    }

    public List<AccountDto> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AccountDto getAccountById(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
        return mapToDto(account);
    }

    public AccountDto getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with Account Number: " + accountNumber));
        return mapToDto(account);
    }

    public List<AccountDto> getAccountsByCustomerId(Integer customerId) {
        return accountRepository.findByCustomerCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AccountDto> searchAccounts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllAccounts();
        }
        return accountRepository.searchAccounts(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AccountDto> filterAccounts(String type, Integer branchId, String status) {
        String cleanType = (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) ? type.trim() : null;
        Integer cleanBranch = (branchId != null && branchId > 0) ? branchId : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;

        return accountRepository.filterAccounts(cleanType, cleanBranch, cleanStatus).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountDto createAccount(AccountDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + dto.getBranchId()));

        String accType = dto.getAccountType();
        if (!accType.equals("Savings") && !accType.equals("Current") && !accType.equals("Fixed Deposit")) {
            throw new BankingBusinessException("Invalid account type: " + accType + ". Must be Savings, Current, or Fixed Deposit.");
        }

        BigDecimal initialBalance = dto.getBalance() != null ? dto.getBalance() : BigDecimal.ZERO;
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new BankingBusinessException("Initial balance cannot be negative.");
        }

        String accountNumber = generateUniqueAccountNumber();

        Account account = new Account(
                accountNumber,
                customer,
                branch,
                accType,
                initialBalance,
                "Active"
        );

        Account saved = accountRepository.save(account);
        return mapToDto(saved);
    }

    @Transactional
    public AccountDto updateAccountStatus(Integer accountId, String status) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!status.equals("Active") && !status.equals("Frozen") && !status.equals("Closed")) {
            throw new BankingBusinessException("Invalid account status. Allowed values: Active, Frozen, Closed.");
        }

        if (status.equals("Closed") && account.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw new BankingBusinessException("Cannot close account with remaining balance of ₹" +
                    account.getBalance() + ". Balance must be zero before closing.");
        }

        account.setAccountStatus(status);
        Account updated = accountRepository.save(account);
        return mapToDto(updated);
    }

    private String generateUniqueAccountNumber() {
        String accNum;
        do {
            long numberPart = 10000000L + (long)(secureRandom.nextDouble() * 90000000L);
            accNum = "BOB" + numberPart;
        } while (accountRepository.existsByAccountNumber(accNum));
        return accNum;
    }

    public AccountDto mapToDto(Account account) {
        AccountDto dto = new AccountDto();
        dto.setAccountId(account.getAccountId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setCustomerId(account.getCustomer().getCustomerId());
        dto.setCustomerName(account.getCustomer().getFullName());
        dto.setBranchId(account.getBranch().getBranchId());
        dto.setBranchName(account.getBranch().getBranchName());
        dto.setIfscCode(account.getBranch().getIfscCode());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        dto.setAccountStatus(account.getAccountStatus());
        dto.setOpenedAt(account.getOpenedAt());
        return dto;
    }
}
