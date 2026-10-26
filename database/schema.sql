-- =====================================================================
-- Bank of Bagru — Bank Management System (Full-Stack RDBMS Project)
-- Database Name: bank_of_bagru_db
-- Target Engine: MySQL 8.0+ / InnoDB
-- Normalization: Fully Normalized to 3NF
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `bank_of_bagru_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bank_of_bagru_db`;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS `bank_transactions`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `branches`;

-- ---------------------------------------------------------------------
-- Table 1: branches
-- Description: Stores bank branch office information across Rajasthan
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: customers
-- Description: Stores customer demographic and contact details
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 3: users (Bank Employees / System Users for Authentication)
-- Description: Stores authenticated employee logins with BCrypt hashed passwords
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `branch_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_users` PRIMARY KEY (`user_id`),
  CONSTRAINT `uk_users_username` UNIQUE (`username`),
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`)
    REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_users_role` CHECK (`role` IN ('ROLE_ADMIN', 'ROLE_TELLER', 'ROLE_MANAGER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 4: accounts
-- Description: Stores financial accounts held by customers in branches
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_accounts_customer` ON `accounts` (`customer_id`);
CREATE INDEX `idx_accounts_branch` ON `accounts` (`branch_id`);
CREATE INDEX `idx_accounts_status` ON `accounts` (`account_status`);

-- ---------------------------------------------------------------------
-- Table 5: bank_transactions
-- Description: Immutable audit ledger recording deposits, withdrawals, transfers
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_txn_account` ON `bank_transactions` (`account_id`);
CREATE INDEX `idx_txn_related_account` ON `bank_transactions` (`related_account_id`);
CREATE INDEX `idx_txn_reference` ON `bank_transactions` (`transaction_reference`);
CREATE INDEX `idx_txn_date` ON `bank_transactions` (`transaction_date`);
CREATE INDEX `idx_txn_type` ON `bank_transactions` (`transaction_type`);

-- ---------------------------------------------------------------------
-- Table 6: loans
-- Description: Stores customer loan applications, approvals, and repayment balances
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_loans_customer` ON `loans` (`customer_id`);
CREATE INDEX `idx_loans_branch` ON `loans` (`branch_id`);
CREATE INDEX `idx_loans_status` ON `loans` (`loan_status`);
