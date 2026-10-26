package com.bankofbagru.service;

import com.bankofbagru.dto.DepositRequest;
import com.bankofbagru.dto.TransferRequest;
import com.bankofbagru.dto.WithdrawalRequest;
import com.bankofbagru.entity.Account;
import com.bankofbagru.entity.BankTransaction;
import com.bankofbagru.exception.BankingBusinessException;
import com.bankofbagru.exception.InsufficientFundsException;
import com.bankofbagru.exception.InvalidAccountStateException;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.AccountRepository;
import com.bankofbagru.repository.BankTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final BankTransactionRepository transactionRepository;

    public TransactionService(AccountRepository accountRepository,
                              BankTransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Executes an Atomic Banking Deposit
     */
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public BankTransaction deposit(DepositRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BankingBusinessException("Deposit amount must be strictly greater than zero.");
        }

        // Lock account row for atomic balance update
        Account account = accountRepository.findByIdWithLock(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + request.getAccountId()));

        if (!"Active".equalsIgnoreCase(account.getAccountStatus())) {
            throw new InvalidAccountStateException("Cannot deposit to account " + account.getAccountNumber() +
                    " because it is currently " + account.getAccountStatus() + ".");
        }

        // Increase balance
        BigDecimal newBalance = account.getBalance().add(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        String reference = generateTransactionReference("DEP");
        String desc = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Cash Deposit to " + account.getAccountNumber();

        BankTransaction txn = new BankTransaction(
                reference,
                account,
                null,
                "Deposit",
                request.getAmount(),
                desc,
                "Success"
        );

        return transactionRepository.save(txn);
    }

    /**
     * Executes an Atomic Banking Withdrawal with Balance Protection
     */
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public BankTransaction withdraw(WithdrawalRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BankingBusinessException("Withdrawal amount must be strictly greater than zero.");
        }

        // Lock account row for concurrency safety
        Account account = accountRepository.findByIdWithLock(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + request.getAccountId()));

        if (!"Active".equalsIgnoreCase(account.getAccountStatus())) {
            throw new InvalidAccountStateException("Cannot withdraw from account " + account.getAccountNumber() +
                    " because it is currently " + account.getAccountStatus() + ".");
        }

        // Enforce non-negative balance constraint
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient balance in account " + account.getAccountNumber() +
                    ". Available balance: ₹" + account.getBalance() + ", Requested: ₹" + request.getAmount());
        }

        // Decrease balance
        BigDecimal newBalance = account.getBalance().subtract(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        String reference = generateTransactionReference("WDL");
        String desc = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Cash Withdrawal from " + account.getAccountNumber();

        BankTransaction txn = new BankTransaction(
                reference,
                account,
                null,
                "Withdrawal",
                request.getAmount(),
                desc,
                "Success"
        );

        return transactionRepository.save(txn);
    }

    /**
     * Executes an Atomic Inter-Account Fund Transfer
     * Acquires locks on both accounts in deterministic order to prevent deadlocks.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public Map<String, Object> transfer(TransferRequest request) {
        if (request.getSourceAccountId().equals(request.getDestinationAccountId())) {
            throw new BankingBusinessException("Source and destination accounts cannot be identical.");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BankingBusinessException("Transfer amount must be strictly greater than zero.");
        }

        // Order lock acquisition by ID to guarantee deadlock avoidance
        Integer firstId = Math.min(request.getSourceAccountId(), request.getDestinationAccountId());
        Integer secondId = Math.max(request.getSourceAccountId(), request.getDestinationAccountId());

        Account firstLocked = accountRepository.findByIdWithLock(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + firstId));
        Account secondLocked = accountRepository.findByIdWithLock(secondId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + secondId));

        Account sourceAccount = request.getSourceAccountId().equals(firstId) ? firstLocked : secondLocked;
        Account destAccount = request.getDestinationAccountId().equals(firstId) ? firstLocked : secondLocked;

        // Validate account states
        if (!"Active".equalsIgnoreCase(sourceAccount.getAccountStatus())) {
            throw new InvalidAccountStateException("Source account " + sourceAccount.getAccountNumber() +
                    " cannot initiate transfers (Status: " + sourceAccount.getAccountStatus() + ").");
        }
        if (!"Active".equalsIgnoreCase(destAccount.getAccountStatus())) {
            throw new InvalidAccountStateException("Destination account " + destAccount.getAccountNumber() +
                    " cannot receive transfers (Status: " + destAccount.getAccountStatus() + ").");
        }

        // Check sufficient balance
        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Transfer declined: Insufficient funds in account " +
                    sourceAccount.getAccountNumber() + ". Available: ₹" + sourceAccount.getBalance() +
                    ", Required: ₹" + request.getAmount());
        }

        // Debit source account
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(sourceAccount);

        // Credit destination account
        destAccount.setBalance(destAccount.getBalance().add(request.getAmount()));
        accountRepository.save(destAccount);

        // Generate unified audit transaction reference
        String sharedReference = generateTransactionReference("TRF");
        String customDesc = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? " - " + request.getDescription().trim()
                : "";

        // 1. Debit Ledger Record (Sender side)
        BankTransaction debitTxn = new BankTransaction(
                sharedReference,
                sourceAccount,
                destAccount,
                "Transfer",
                request.getAmount(),
                "Transfer to " + destAccount.getAccountNumber() + " (" + destAccount.getCustomer().getFullName() + ")" + customDesc,
                "Success"
        );
        transactionRepository.save(debitTxn);

        // 2. Credit Ledger Record (Recipient side)
        BankTransaction creditTxn = new BankTransaction(
                sharedReference,
                destAccount,
                sourceAccount,
                "Transfer",
                request.getAmount(),
                "Transfer from " + sourceAccount.getAccountNumber() + " (" + sourceAccount.getCustomer().getFullName() + ")" + customDesc,
                "Success"
        );
        transactionRepository.save(creditTxn);

        Map<String, Object> receipt = new HashMap<>();
        receipt.put("reference", sharedReference);
        receipt.put("transactionType", "Transfer");
        receipt.put("amount", request.getAmount());
        receipt.put("sourceAccountNumber", sourceAccount.getAccountNumber());
        receipt.put("sourceCustomerName", sourceAccount.getCustomer().getFullName());
        receipt.put("destinationAccountNumber", destAccount.getAccountNumber());
        receipt.put("destinationCustomerName", destAccount.getCustomer().getFullName());
        receipt.put("sourceNewBalance", sourceAccount.getBalance());
        receipt.put("destinationNewBalance", destAccount.getBalance());
        receipt.put("timestamp", LocalDateTime.now());
        receipt.put("status", "Success");
        return receipt;
    }

    public List<BankTransaction> getTransactionsByAccountId(Integer accountId) {
        return transactionRepository.findByAccountAccountIdOrderByTransactionDateDesc(accountId);
    }

    public List<BankTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<BankTransaction> searchTransactions(Integer accountId, String type, String status,
                                                    LocalDateTime startDate, LocalDateTime endDate) {
        String cleanType = (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) ? type.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;
        Integer cleanAccountId = (accountId != null && accountId > 0) ? accountId : null;

        return transactionRepository.searchTransactions(cleanAccountId, cleanType, cleanStatus, startDate, endDate);
    }

    private String generateTransactionReference(String prefix) {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + dateStr + randomSuffix;
    }
}
