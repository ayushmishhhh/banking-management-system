-- =====================================================================
-- Bank of Bagru — Seed Data for Academic Demonstration
-- Database: bank_of_bagru_db
-- =====================================================================

USE `bank_of_bagru_db`;

-- 1. Insert Branches in Jaipur / Bagru Region
INSERT INTO `branches` (`branch_id`, `branch_name`, `ifsc_code`, `branch_address`, `city`, `state`) VALUES
(1, 'Bagru Industrial Estate Branch', 'BOB0000001', 'Plot 45, RIICO Industrial Area, Bagru', 'Jaipur', 'Rajasthan'),
(2, 'Jaipur Main Branch (MI Road)', 'BOB0000002', '124, Mirza Ismail Road, Near Panch Batti', 'Jaipur', 'Rajasthan'),
(3, 'Vaishali Nagar Branch', 'BOB0000003', 'Plot 18, Amrapali Marg, Vaishali Nagar', 'Jaipur', 'Rajasthan'),
(4, 'Mansarovar Metro Branch', 'BOB0000004', 'Shop 7-8, Madhyam Marg, Mansarovar', 'Jaipur', 'Rajasthan'),
(5, 'Malviya Nagar Branch', 'BOB0000005', 'Sector 3, Calgiri Hospital Road, Malviya Nagar', 'Jaipur', 'Rajasthan');

-- 2. Insert Customers
INSERT INTO `customers` (`customer_id`, `full_name`, `date_of_birth`, `email`, `phone`, `address`, `created_at`) VALUES
(1, 'Aarav Sharma', '1992-05-14', 'aarav.sharma@example.com', '9829012345', '12, Shanti Nagar, Bagru, Jaipur', '2026-01-10 09:30:00'),
(2, 'Priya Rathore', '1995-11-20', 'priya.rathore@example.com', '9829023456', '54, Hanuman Nagar, Vaishali, Jaipur', '2026-01-15 10:15:00'),
(3, 'Rajendra Singh Shekhawat', '1984-03-08', 'rajendra.shekhawat@example.com', '9829034567', '78, Civil Lines, Jaipur', '2026-02-01 11:00:00'),
(4, 'Ananya Verma', '1998-08-25', 'ananya.verma@example.com', '9829045678', 'Plot 101, Shipra Path, Mansarovar, Jaipur', '2026-02-14 14:20:00'),
(5, 'Vikramaditya Jain', '1990-12-03', 'vikram.jain@example.com', '9829056789', '23, Johari Bazar, Pink City, Jaipur', '2026-02-20 16:45:00'),
(6, 'Sunita Choudhary', '1988-07-19', 'sunita.choudhary@example.com', '9829067890', 'Village Kalwar, Near Bagru Link Road, Jaipur', '2026-03-05 10:00:00'),
(7, 'Deepak Khandelwal', '1993-09-30', 'deepak.k@example.com', '9829078901', '88, Gaurav Tower Road, Malviya Nagar, Jaipur', '2026-03-12 12:30:00'),
(8, 'Meenakshi Meena', '1996-04-11', 'meenakshi.m@example.com', '9829089012', 'B-14, Vidyadhar Nagar, Jaipur', '2026-03-22 15:10:00'),
(9, 'Rohitashwa Mathur', '1982-01-17', 'rohit.mathur@example.com', '9829090123', '41, C-Scheme, Ashok Nagar, Jaipur', '2026-04-02 11:45:00'),
(10, 'Kavita Agarwal', '1999-06-28', 'kavita.agarwal@example.com', '9829001234', '15, Raja Park, Jaipur', '2026-04-10 13:00:00');

-- 3. Insert Users (Employees)
-- Password hashes generated with BCrypt (Pass: admin123, teller123, manager123)
-- $2a$10$wS9l4u45FmKzXUq8Ww66cOb6m0E7I2H2U9v3UeL.Vd0y3m8w1R3G2 -> standard BCrypt for admin123
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `role`, `branch_id`) VALUES
(1, 'admin', '$2a$10$7Zb4s542lM.R/5tU.pWZZOf7k6pE2tWfXbQ6rTqC8kL6vV9uHqZ9K', 'System Administrator', 'ROLE_ADMIN', 1),
(2, 'teller', '$2a$10$7Zb4s542lM.R/5tU.pWZZOf7k6pE2tWfXbQ6rTqC8kL6vV9uHqZ9K', 'Naveen Kumar (Teller)', 'ROLE_TELLER', 1),
(3, 'manager', '$2a$10$7Zb4s542lM.R/5tU.pWZZOf7k6pE2tWfXbQ6rTqC8kL6vV9uHqZ9K', 'Shweta Sharma (Branch Manager)', 'ROLE_MANAGER', 2);

-- 4. Insert Accounts
INSERT INTO `accounts` (`account_id`, `account_number`, `customer_id`, `branch_id`, `account_type`, `balance`, `account_status`, `opened_at`) VALUES
(1, 'BOB10010001', 1, 1, 'Savings', 85000.00, 'Active', '2026-01-10 10:00:00'),
(2, 'BOB10010002', 1, 1, 'Fixed Deposit', 200000.00, 'Active', '2026-01-12 11:30:00'),
(3, 'BOB10020001', 2, 3, 'Savings', 142500.50, 'Active', '2026-01-15 11:00:00'),
(4, 'BOB10030001', 3, 2, 'Current', 580000.00, 'Active', '2026-02-01 12:00:00'),
(5, 'BOB10040001', 4, 4, 'Savings', 63200.00, 'Active', '2026-02-14 15:00:00'),
(6, 'BOB10050001', 5, 2, 'Current', 420000.00, 'Active', '2026-02-20 17:00:00'),
(7, 'BOB10060001', 6, 1, 'Savings', 35000.00, 'Active', '2026-03-05 10:30:00'),
(8, 'BOB10070001', 7, 5, 'Savings', 195000.00, 'Active', '2026-03-12 13:00:00'),
(9, 'BOB10080001', 8, 3, 'Savings', 45000.00, 'Frozen', '2026-03-22 15:45:00'),
(10, 'BOB10090001', 9, 2, 'Current', 310000.00, 'Active', '2026-04-02 12:30:00'),
(11, 'BOB10100001', 10, 5, 'Savings', 78500.00, 'Active', '2026-04-10 14:00:00'),
(12, 'BOB10030002', 3, 2, 'Fixed Deposit', 500000.00, 'Active', '2026-04-15 16:00:00');

-- 5. Insert Bank Transactions (Deposits, Withdrawals, Transfers)
INSERT INTO `bank_transactions` (`transaction_id`, `transaction_reference`, `account_id`, `related_account_id`, `transaction_type`, `amount`, `transaction_date`, `description`, `transaction_status`) VALUES
(1, 'TXN20260110001', 1, NULL, 'Deposit', 50000.00, '2026-01-10 10:15:00', 'Initial account opening deposit', 'Success'),
(2, 'TXN20260115002', 1, NULL, 'Deposit', 45000.00, '2026-01-15 11:30:00', 'Salary credit January 2026', 'Success'),
(3, 'TXN20260120003', 1, NULL, 'Withdrawal', 10000.00, '2026-01-20 14:00:00', 'ATM Cash Withdrawal Bagru', 'Success'),
(4, 'TXN20260125004', 3, NULL, 'Deposit', 150000.00, '2026-01-25 09:45:00', 'Cheque deposit clearing', 'Success'),
(5, 'TXN20260201005', 4, NULL, 'Deposit', 600000.00, '2026-02-01 12:30:00', 'Business turnover deposit', 'Success'),
(6, 'TXN20260205006', 4, NULL, 'Withdrawal', 20000.00, '2026-02-05 16:10:00', 'Vendor payment via cheque', 'Success'),
(7, 'TXN20260210007', 1, 3, 'Transfer', 25000.00, '2026-02-10 11:20:00', 'Fund transfer to Priya Rathore (BOB10020001)', 'Success'),
(8, 'TXN20260210008', 3, 1, 'Transfer', 25000.00, '2026-02-10 11:20:00', 'Received fund transfer from Aarav Sharma (BOB10010001)', 'Success'),
(9, 'TXN20260301009', 5, NULL, 'Deposit', 75000.00, '2026-03-01 10:05:00', 'Freelance consultation fees', 'Success'),
(10, 'TXN20260315010', 6, NULL, 'Deposit', 40000.00, '2026-03-15 13:40:00', 'Agricultural yield proceeds', 'Success'),
(11, 'TXN20260318011', 6, NULL, 'Withdrawal', 5000.00, '2026-03-18 15:15:00', 'Cash withdrawal Bagru branch', 'Success'),
(12, 'TXN20260405012', 4, 6, 'Transfer', 15000.00, '2026-04-05 14:30:00', 'Payment to Sunita Choudhary', 'Success'),
(13, 'TXN20260405013', 6, 4, 'Transfer', 15000.00, '2026-04-05 14:30:00', 'Received from Shekhawat Enterprises', 'Success');

-- 6. Insert Loans
INSERT INTO `loans` (`loan_id`, `customer_id`, `branch_id`, `loan_type`, `principal_amount`, `interest_rate`, `tenure_months`, `loan_status`, `outstanding_amount`, `application_date`) VALUES
(1, 1, 1, 'Personal', 250000.00, 11.50, 36, 'Approved', 185000.00, '2026-01-20 11:00:00'),
(2, 2, 3, 'Education', 800000.00, 8.75, 60, 'Approved', 720000.00, '2026-02-05 14:15:00'),
(3, 3, 2, 'Home', 4500000.00, 8.40, 180, 'Approved', 4320000.00, '2026-02-18 10:45:00'),
(4, 4, 4, 'Vehicle', 650000.00, 9.20, 48, 'Pending', 650000.00, '2026-04-12 16:30:00'),
(5, 5, 2, 'Personal', 300000.00, 12.00, 24, 'Pending', 300000.00, '2026-04-18 09:50:00'),
(6, 7, 5, 'Vehicle', 900000.00, 8.90, 60, 'Approved', 840000.00, '2026-03-25 15:20:00'),
(7, 8, 3, 'Personal', 150000.00, 13.00, 12, 'Rejected', 150000.00, '2026-03-28 11:10:00');
