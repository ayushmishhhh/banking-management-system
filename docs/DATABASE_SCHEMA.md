# Database Schema Documentation — Bank of Bagru

**Database Name:** `bank_of_bagru_db`  
**RDBMS Engine:** MySQL 8.0 (InnoDB)  
**Character Set & Collation:** `utf8mb4` / `utf8mb4_unicode_ci`  
**Academic Level:** 3rd Semester B.Tech / BCA / MCA Relational Database Management Systems (RDBMS)

---

## 1. Relational Tables Overview

| Table Name | Description | Primary Key | Foreign Keys | Engine |
| :--- | :--- | :--- | :--- | :--- |
| `branches` | Bank branch locations across Jaipur / Rajasthan | `branch_id` | None | InnoDB |
| `customers` | Customer demographic, KYC, and contact data | `customer_id` | None | InnoDB |
| `users` | Authenticated employees with BCrypt password hashes | `user_id` | `branch_id` &rarr; `branches` | InnoDB |
| `accounts` | Customer deposit and current bank accounts | `account_id` | `customer_id` &rarr; `customers`<br>`branch_id` &rarr; `branches` | InnoDB |
| `bank_transactions` | Immutable audit ledger of deposits, withdrawals, transfers | `transaction_id` | `account_id` &rarr; `accounts`<br>`related_account_id` &rarr; `accounts` | InnoDB |
| `loans` | Loan facilities, underwriting statuses, and outstanding amounts | `loan_id` | `customer_id` &rarr; `customers`<br>`branch_id` &rarr; `branches` | InnoDB |

---

## 2. Table Specifications & Data Dictionaries

### A. `branches` Table
Stores physical banking offices and branch identifiers.

```sql
CREATE TABLE `branches` (
  `branch_id` INT AUTO_INCREMENT,
  `branch_name` VARCHAR(100) NOT NULL,
  `ifsc_code` VARCHAR(20) NOT NULL,
  `branch_address` TEXT NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `state` VARCHAR(50) NOT NULL DEFAULT 'Rajasthan',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_branches` PRIMARY KEY (`branch_id`),
  CONSTRAINT `uk_branches_ifsc` UNIQUE (`ifsc_code`)
) ENGINE=InnoDB;
```

### B. `customers` Table
Stores customer personal information and contact details.

```sql
CREATE TABLE `customers` (
  `customer_id` INT AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_customers` PRIMARY KEY (`customer_id`),
  CONSTRAINT `uk_customers_email` UNIQUE (`email`),
  CONSTRAINT `uk_customers_phone` UNIQUE (`phone`)
) ENGINE=InnoDB;
```

### C. `accounts` Table
Stores bank accounts owned by customers in respective branches.

```sql
CREATE TABLE `accounts` (
  `account_id` INT AUTO_INCREMENT,
  `account_number` VARCHAR(30) NOT NULL,
  `customer_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `account_type` VARCHAR(20) NOT NULL,
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `account_status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `opened_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_accounts` PRIMARY KEY (`account_id`),
  CONSTRAINT `uk_accounts_number` UNIQUE (`account_number`),
  CONSTRAINT `fk_accounts_customer` FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_accounts_branch` FOREIGN KEY (`branch_id`)
    REFERENCES `branches` (`branch_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_accounts_type` CHECK (`account_type` IN ('Savings', 'Current', 'Fixed Deposit')),
  CONSTRAINT `chk_accounts_status` CHECK (`account_status` IN ('Active', 'Frozen', 'Closed')),
  CONSTRAINT `chk_accounts_balance` CHECK (`balance` >= 0)
) ENGINE=InnoDB;
```

### D. `bank_transactions` Table
Stores immutable financial ledger entries.

```sql
CREATE TABLE `bank_transactions` (
  `transaction_id` INT AUTO_INCREMENT,
  `transaction_reference` VARCHAR(60) NOT NULL,
  `account_id` INT NOT NULL,
  `related_account_id` INT NULL,
  `transaction_type` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `transaction_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` VARCHAR(255) NULL,
  `transaction_status` VARCHAR(20) NOT NULL DEFAULT 'Success',
  CONSTRAINT `pk_bank_transactions` PRIMARY KEY (`transaction_id`),
  CONSTRAINT `fk_txn_account` FOREIGN KEY (`account_id`)
    REFERENCES `accounts` (`account_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_txn_related_account` FOREIGN KEY (`related_account_id`)
    REFERENCES `accounts` (`account_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_txn_type` CHECK (`transaction_type` IN ('Deposit', 'Withdrawal', 'Transfer')),
  CONSTRAINT `chk_txn_status` CHECK (`transaction_status` IN ('Success', 'Failed')),
  CONSTRAINT `chk_txn_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB;
```

### E. `loans` Table
Stores credit facilities and repayment tracking.

```sql
CREATE TABLE `loans` (
  `loan_id` INT AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `loan_type` VARCHAR(20) NOT NULL,
  `principal_amount` DECIMAL(15,2) NOT NULL,
  `interest_rate` DECIMAL(5,2) NOT NULL,
  `tenure_months` INT NOT NULL,
  `loan_status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
  `outstanding_amount` DECIMAL(15,2) NOT NULL,
  `application_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_loans` PRIMARY KEY (`loan_id`),
  CONSTRAINT `fk_loans_customer` FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_loans_branch` FOREIGN KEY (`branch_id`)
    REFERENCES `branches` (`branch_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_loans_type` CHECK (`loan_type` IN ('Personal', 'Home', 'Education', 'Vehicle')),
  CONSTRAINT `chk_loans_status` CHECK (`loan_status` IN ('Pending', 'Approved', 'Rejected', 'Closed')),
  CONSTRAINT `chk_loans_principal` CHECK (`principal_amount` > 0),
  CONSTRAINT `chk_loans_outstanding` CHECK (`outstanding_amount` >= 0)
) ENGINE=InnoDB;
```

---

## 3. Database Normalization Proofs (1NF to 3NF)

### First Normal Form (1NF)
1. **Atomic Attributes:** All column values are atomic and cannot be divided further without losing business context.
2. **No Repeating Groups:** Instead of storing multiple transactions within an account row, transactions reside in a child relation `bank_transactions`.
3. **Primary Keys:** Every relation has an explicitly identified, non-null primary key.

### Second Normal Form (2NF)
1. **1NF Compliance:** Verified above.
2. **Full Functional Dependency (No Partial Dependency):** Every non-prime attribute depends on the *entire* candidate key. Because every table uses a single-column surrogate primary key (`customer_id`, `branch_id`, `account_id`, `transaction_id`, `loan_id`), partial key dependency is non-existent.

### Third Normal Form (3NF)
1. **2NF Compliance:** Verified above.
2. **No Transitive Dependencies ($X \rightarrow Y$ and $Y \rightarrow Z$ where $Z$ is non-prime):**
   - In `accounts`, branch metadata (`branch_name`, `ifsc_code`, `city`) is not stored directly. If it were, $account\_id \rightarrow branch\_id \rightarrow branch\_name$ would be a transitive dependency. Decomposing branch details into `branches` satisfies 3NF.
   - In `loans`, customer information (`full_name`, `email`, `phone`) is not duplicated.

---

## 4. Referential Integrity & Cascade Semantics

- `ON DELETE RESTRICT`: Used on `customers` and `branches` foreign keys. A customer cannot be deleted while they maintain active accounts or loans.
- `ON UPDATE CASCADE`: If an identifier or unique code is adjusted, foreign keys synchronize automatically.
- Database CHECK constraints prevent corrupted monetary data at the storage layer independently of application logic.
