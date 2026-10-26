# Entity-Relationship (ER) Diagram — Bank of Bagru

The following diagram illustrates the relational database design for **Bank of Bagru** (`bank_of_bagru_db`) with table relationships, primary keys, and foreign keys.

```mermaid
erDiagram
    BRANCHES ||--o{ ACCOUNTS : "maintains (1:N)"
    CUSTOMERS ||--o{ ACCOUNTS : "owns (1:N)"
    BRANCHES ||--o{ LOANS : "underwrites (1:N)"
    CUSTOMERS ||--o{ LOANS : "applies for (1:N)"
    BRANCHES ||--o{ USERS : "employs (1:N)"
    ACCOUNTS ||--o{ BANK_TRANSACTIONS : "records debits/credits (1:N)"
    ACCOUNTS ||--o{ BANK_TRANSACTIONS : "counterparty for transfers (1:N)"

    BRANCHES {
        int branch_id PK "AUTO_INCREMENT"
        varchar branch_name "NOT NULL"
        varchar ifsc_code UK "UNIQUE, NOT NULL"
        text branch_address "NOT NULL"
        varchar city "NOT NULL"
        varchar state "NOT NULL DEFAULT 'Rajasthan'"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    CUSTOMERS {
        int customer_id PK "AUTO_INCREMENT"
        varchar full_name "NOT NULL"
        date date_of_birth "NOT NULL"
        varchar email UK "UNIQUE, NOT NULL"
        varchar phone UK "UNIQUE, NOT NULL"
        text address "NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    USERS {
        int user_id PK "AUTO_INCREMENT"
        varchar username UK "UNIQUE, NOT NULL"
        varchar password_hash "BCrypt Encrypted"
        varchar full_name "NOT NULL"
        varchar role "ROLE_ADMIN, ROLE_TELLER, ROLE_MANAGER"
        int branch_id FK "REFERENCES branches(branch_id)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    ACCOUNTS {
        int account_id PK "AUTO_INCREMENT"
        varchar account_number UK "UNIQUE, NOT NULL"
        int customer_id FK "REFERENCES customers(customer_id)"
        int branch_id FK "REFERENCES branches(branch_id)"
        varchar account_type "Savings, Current, Fixed Deposit"
        decimal balance "DECIMAL(15,2) >= 0"
        varchar account_status "Active, Frozen, Closed"
        timestamp opened_at "DEFAULT CURRENT_TIMESTAMP"
    }

    BANK_TRANSACTIONS {
        int transaction_id PK "AUTO_INCREMENT"
        varchar transaction_reference "Audit Reference"
        int account_id FK "REFERENCES accounts(account_id)"
        int related_account_id FK "Nullable Counterparty Account"
        varchar transaction_type "Deposit, Withdrawal, Transfer"
        decimal amount "DECIMAL(15,2) > 0"
        timestamp transaction_date "DEFAULT CURRENT_TIMESTAMP"
        varchar description "Audit narrative"
        varchar transaction_status "Success, Failed"
    }

    LOANS {
        int loan_id PK "AUTO_INCREMENT"
        int customer_id FK "REFERENCES customers(customer_id)"
        int branch_id FK "REFERENCES branches(branch_id)"
        varchar loan_type "Personal, Home, Education, Vehicle"
        decimal principal_amount "DECIMAL(15,2) > 0"
        decimal interest_rate "Annual Percentage Rate"
        int tenure_months "Term in Months"
        varchar loan_status "Pending, Approved, Rejected, Closed"
        decimal outstanding_amount "DECIMAL(15,2) >= 0"
        timestamp application_date "DEFAULT CURRENT_TIMESTAMP"
    }
```

---

## Cardinality Summary

1. **Customers &rarr; Accounts (1:N):**
   - Minimum: 0 (A newly registered customer may not yet have opened an account)
   - Maximum: $N$ (A customer can have multiple savings, current, and term deposit accounts)
2. **Branches &rarr; Accounts (1:N):**
   - Minimum: 0
   - Maximum: $N$ (A physical branch maintains multiple accounts)
3. **Customers &rarr; Loans (1:N):**
   - A customer can have zero or multiple loan facilities.
4. **Accounts &rarr; Bank Transactions (1:N):**
   - Every deposit, withdrawal, or transfer produces an entry in `bank_transactions`.
5. **Transfers (Self-Referential Association):**
   - During a fund transfer, two ledger records share the same `transaction_reference`:
     - Sending account entry (`account_id` = Sender, `related_account_id` = Recipient)
     - Receiving account entry (`account_id` = Recipient, `related_account_id` = Sender)
