# Academic Project Report — Bank Management System

**Project Title:** Bank of Bagru — Full-Stack Relational Database Management System  
**Subject:** Relational Database Management Systems (RDBMS) — 3rd Semester  
**Architecture:** Three-Tier Architecture (Client-Server-Database)  
**Database:** MySQL 8.0 (InnoDB Engine)  
**Backend:** Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate  
**Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons  

---

## 1. Executive Summary

The **Bank of Bagru Core Banking Management System** is an enterprise-grade academic RDBMS project engineered to demonstrate practical relational database design, database normalization up to Third Normal Form (3NF), declarative and procedural integrity constraints, relational algebra queries (multi-table joins, aggregations, correlated subqueries), concurrency control, and ACID transactional atomicity.

Unlike mock frontend prototypes, the application maintains a strict separation of concerns where every business action—from customer registration and account opening to debit/credit operations, inter-account fund transfers, and loan underwriting—is processed through an enterprise Spring Boot REST API and persisted in a MySQL 8 relational database.

---

## 2. Relational Database Concepts Demonstrated

### 2.1 Keys & Constraints
- **Primary Keys (PK):** Auto-incrementing surrogate keys across all tables to uniquely identify tuples without dependency on mutable business codes.
- **Foreign Keys (FK):** Enforced across `accounts(customer_id, branch_id)`, `bank_transactions(account_id, related_account_id)`, and `loans(customer_id, branch_id)`.
- **Unique Constraints (UK):**
  - `branches.ifsc_code` (11-character Indian Financial System Code)
  - `customers.email` and `customers.phone`
  - `accounts.account_number`
  - `users.username`
- **Domain CHECK Constraints:**
  - `accounts.balance >= 0` (guarantees balance non-negativity at the storage engine level)
  - `bank_transactions.amount > 0`
  - `loans.principal_amount > 0` and `loans.outstanding_amount >= 0`
  - ENUM-like checks on statuses (`Active`, `Frozen`, `Closed`, `Pending`, `Approved`, `Rejected`)
- **Referential Integrity Rules:**
  - `ON DELETE RESTRICT` protects against accidental customer or branch deletion when active accounts exist.
  - `ON UPDATE CASCADE` maintains synchronization across relational links.

### 2.2 Normalization Analysis
- **First Normal Form (1NF):** Attained by enforcing attribute atomicity (e.g. discrete name, email, phone, and address columns) and separating repeating ledger events into `bank_transactions`.
- **Second Normal Form (2NF):** Attained because all tables use single-column primary keys; partial functional dependencies on composite candidate keys are mathematically impossible.
- **Third Normal Form (3NF):** Attained by removing transitive dependencies ($A \rightarrow B \rightarrow C$). Branch office attributes (branch name, IFSC, address, city) were separated from `accounts` into `branches`. Customer profile information was separated from `accounts` and `loans`.

### 2.3 ACID Transactions & Concurrency Control
- **Atomicity:** Inter-account transfers require debiting the source account, crediting the destination account, and inserting audit ledger rows. Under Spring's `@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)`, any failure (e.g., negative balance violation or account freeze) immediately triggers an unrecoverable database rollback.
- **Consistency:** Enforced via storage engine CHECK constraints and JPA validations.
- **Isolation:** Managed through MySQL InnoDB's row-level locking. Critical operations invoke pessimistic write locks (`SELECT ... FOR UPDATE` via `@Lock(LockModeType.PESSIMISTIC_WRITE)`) in a deterministic ordering of account IDs, mathematically preventing database deadlocks.
- **Durability:** Committed transactions are flushed to InnoDB's doublewrite buffer and redo log files on disk.

---

## 3. SQL Query Catalog & Relational Algebra

### 3.1 Multi-Table INNER JOIN
Retrieves consolidated account portfolios by joining across three normalized tables:
```sql
SELECT a.account_number, c.full_name AS customer_name, c.phone,
       b.branch_name, b.ifsc_code, a.account_type, a.balance, a.account_status
FROM accounts a
INNER JOIN customers c ON a.customer_id = c.customer_id
INNER JOIN branches b ON a.branch_id = b.branch_id
ORDER BY a.balance DESC;
```

### 3.2 Aggregate Functions with GROUP BY and HAVING
Calculates liquidity aggregation per branch, filtering branches exceeding ₹1,00,000 using the `HAVING` clause:
```sql
SELECT b.branch_name, b.city,
       COUNT(a.account_id) AS total_accounts,
       SUM(a.balance) AS branch_total_balance,
       ROUND(AVG(a.balance), 2) AS avg_account_balance
FROM branches b
INNER JOIN accounts a ON b.branch_id = a.branch_id
WHERE a.account_status = 'Active'
GROUP BY b.branch_id, b.branch_name, b.city
HAVING branch_total_balance > 100000
ORDER BY branch_total_balance DESC;
```

### 3.3 Correlated / Scalar Subquery
Finds accounts holding balances strictly higher than the bank-wide average:
```sql
SELECT a.account_number, c.full_name, a.account_type, a.balance,
       (SELECT ROUND(AVG(balance), 2) FROM accounts WHERE account_status = 'Active') AS bank_avg_balance
FROM accounts a
INNER JOIN customers c ON a.customer_id = c.customer_id
WHERE a.balance > (SELECT AVG(balance) FROM accounts WHERE account_status = 'Active')
ORDER BY a.balance DESC;
```

---

## 4. System Implementation Verification

- **Automated Integration Test Results:** 100% passed across authentication, dashboard stats, customer management, account creation, cash deposit, and atomic inter-account transfer.
- **Deadlock Mitigation:** Multi-row lock acquisitions order account IDs (`min(id1, id2)`, then `max(id1, id2)`).
- **Audit Ledger:** Dual-sided ledger entries recorded with shared UUID-based audit references (`transaction_reference`).
