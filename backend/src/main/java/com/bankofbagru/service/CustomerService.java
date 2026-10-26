package com.bankofbagru.service;

import com.bankofbagru.dto.CustomerDto;
import com.bankofbagru.entity.Customer;
import com.bankofbagru.exception.BankingBusinessException;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.AccountRepository;
import com.bankofbagru.repository.CustomerRepository;
import com.bankofbagru.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final LoanRepository loanRepository;

    public CustomerService(CustomerRepository customerRepository,
                           AccountRepository accountRepository,
                           LoanRepository loanRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.loanRepository = loanRepository;
    }

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapToDto(customer);
    }

    public List<CustomerDto> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerDto createCustomer(CustomerDto dto) {
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new BankingBusinessException("A customer with email " + dto.getEmail() + " already exists.");
        }
        if (customerRepository.existsByPhone(dto.getPhone())) {
            throw new BankingBusinessException("A customer with phone number " + dto.getPhone() + " already exists.");
        }

        Customer customer = new Customer(
                dto.getFullName(),
                dto.getDateOfBirth(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress()
        );
        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Transactional
    public CustomerDto updateCustomer(Integer id, CustomerDto dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // Validate uniqueness if email changed
        if (!customer.getEmail().equalsIgnoreCase(dto.getEmail()) && customerRepository.existsByEmail(dto.getEmail())) {
            throw new BankingBusinessException("A customer with email " + dto.getEmail() + " already exists.");
        }
        // Validate uniqueness if phone changed
        if (!customer.getPhone().equals(dto.getPhone()) && customerRepository.existsByPhone(dto.getPhone())) {
            throw new BankingBusinessException("A customer with phone number " + dto.getPhone() + " already exists.");
        }

        customer.setFullName(dto.getFullName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());

        Customer updated = customerRepository.save(customer);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // Enforce Referential Integrity Banking Rules
        long accountsCount = accountRepository.countByCustomerCustomerId(id);
        if (accountsCount > 0) {
            throw new BankingBusinessException("Cannot delete customer: Customer has " + accountsCount +
                    " linked bank account(s). Close and remove accounts first (Referential Integrity Check).");
        }

        long activeLoans = loanRepository.countByCustomerCustomerIdAndLoanStatus(id, "Approved");
        if (activeLoans > 0) {
            throw new BankingBusinessException("Cannot delete customer: Customer has " + activeLoans +
                    " active approved loan(s) pending settlement.");
        }

        customerRepository.delete(customer);
    }

    private CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setCustomerId(customer.getCustomerId());
        dto.setFullName(customer.getFullName());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setAccountsCount(accountRepository.countByCustomerCustomerId(customer.getCustomerId()));
        dto.setActiveLoansCount(loanRepository.countByCustomerCustomerIdAndLoanStatus(customer.getCustomerId(), "Approved"));
        return dto;
    }
}
