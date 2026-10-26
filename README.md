# Bank of Bagru — Core Banking Management System
> **Full-Stack Relational Database Management System (RDBMS) College Project**  
> *Designed for 3rd Semester Database Systems Evaluation & Portfolio Showcase*

---

## 🏛️ Project Overview

**Bank of Bagru** is a full-stack, enterprise-grade Bank Management System built for an academic RDBMS evaluation. The system demonstrates database design, 3NF normalization, primary keys, foreign keys, CHECK constraints, multi-table JOINs, aggregate functions, ACID transactions, and complete CRUD operations.

Every action in the user interface communicates via RESTful JSON APIs to a Java Spring Boot backend and persists data in a normalized MySQL 8 relational database.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js with Vite | React 18, Vite 5 | Reactive Single Page Application |
| **Styling** | Tailwind CSS | 3.4.x | Fintech Navy Blue / Slate Design |
| **Icons** | Lucide React | Latest | Modern financial UI icons |
| **Backend** | Java with Spring Boot | Java 21, Spring Boot 3.3.4 | RESTful Web Services & Business Logic |
| **Persistence** | Spring Data JPA / Hibernate | 6.5.x | ORM, Criteria, & Pessimistic Row Locking |
| **Security** | Spring Security | Latest | BCrypt password hashing & authorization |
| **Database** | MySQL 8.0 (InnoDB) | 8.0.x | Relational storage & ACID Transactions |
| **Build Tools** | Maven & npm | Maven 3.9.9, Node 24 | Compilation, bundling, dependency management |

---

## 💼 Core Banking Features

### 1. Modern Fintech Dashboard
- **Live MySQL Statistics:** Real-time metrics for total customers, accounts, bank liquidity, deposits, withdrawals, transfers, and loans.
- **Visual Analytics:** Account type distribution progress bars (Savings, Current, Fixed Deposit) and monthly transaction volume summary.
- **Audit Table:** Recent 10 ledger entries with account and counterparty references.

### 2. Customer Management (KYC)
- Register verified customers with full name, DOB, unique email, 10-digit phone, and address.
- Search customers by name, email, phone number, or Customer ID.
- **Relational Portfolio Drawer:** Click the view button on any customer to inspect all their linked bank accounts and loan facilities in real time.
- **Integrity Protection:** Deletion is blocked (`ON DELETE RESTRICT`) if the customer has open bank accounts or active loans.

### 3. Account Management
- Open Savings, Current, or Fixed Deposit accounts with automatic backend generation of unique 11-digit numbers (`BOBxxxxxxxx`).
- Filter accounts by type, branch, and status (`Active`, `Frozen`, `Closed`).
- Operational freeze/unfreeze controls.
- Closing account safeguard: Rejects closing accounts with non-zero balances.

### 4. Banking Transactions & Concurrency Control
- **Cash Deposit:** Validates active status, increases balance, and creates an immutable ledger entry.
- **Cash Withdrawal:** Checks available funds, blocks overdrafts (balance $\ge 0$), and debits account atomically.
- **Inter-Account Fund Transfer:**
  - Validates source and destination accounts.
  - Acquires pessimistic locks (`SELECT ... FOR UPDATE`) in deterministic order to eliminate database deadlocks.
  - Debits sender and credits recipient within a single Spring `@Transactional(isolation = READ_COMMITTED)` boundary.
  - Emits dual ledger entries sharing a single audit reference (`transaction_reference`).
  - Generates an official, printable transaction receipt voucher.
- **Transaction History:** Filter by account, type, date interval, and status.

### 5. Loan Facilities & Underwriting
- Submit loan applications (Personal, Home, Education, Vehicle) with principal, interest rate, and tenure.
- Built-in monthly EMI estimation calculator.
- Branch manager approval and rejection workflows.
- Partial and full loan repayment tracking (transitions to `Closed` on zero balance).

### 6. Regulatory Reports & Statements
- **Account Statement Generator:** Select any account and date window to view opening balance, credits, debits, closing balance, and transaction lines with print layout.
- **Branch Performance Report:** Multi-table LEFT JOIN across branches, accounts, and loans.
- **High-Value AML Report:** Flags transactions meeting or exceeding threshold limits (e.g. ₹50,000).
- **Loan Portfolio Report:** Aggregates principal, outstanding exposure, and average rates by category.

### 7. Interactive Database Information & Academic Showcase
- **Entity-Relationship Diagram:** Visual relationship mapping in Crow's foot notation.
- **Live Data Dictionary:** Live table inspector querying MySQL's `INFORMATION_SCHEMA.COLUMNS` with column types, keys, and row counts.
- **Normalization Proofs:** In-depth proofs for 1NF, 2NF, and 3NF compliance.
- **Interactive SQL Query Runner:** Live execution of 3-way multi-table JOINs, GROUP BY with HAVING, and correlated subqueries.

---

## 🗄️ Database Architecture & Normalization (3NF)

Database Name: `bank_of_bagru_db`

```
  +--------------------+               +--------------------+
  |      BRANCHES      |               |     CUSTOMERS      |
  +--------------------+               +--------------------+
  | PK branch_id       |<--------+     | PK customer_id     |<---------+
  |    branch_name     |         |     |    full_name       |          |
  | UK ifsc_code       |         |     |    date_of_birth   |          |
  |    branch_address  |         |     | UK email           |          |
  |    city            |         |     | UK phone           |          |
  |    state           |         |     |    address         |          |
  +--------------------+         |     +--------------------+          |
            |                    |               |                     |
     (1:N)  |             (1:N)  |        (1:N)  |              (1:N)  |
            v                    |               v                     |
  +--------------------+         |     +--------------------+          |
  |      ACCOUNTS      |         |     |       LOANS        |          |
  +--------------------+         |     +--------------------+          |
  | PK account_id      |         |     | PK loan_id         |          |
  | UK account_number  |         |     | FK customer_id ----+----------+
  | FK customer_id ----+---------|-----+    FK branch_id   ----+----------+
  | FK branch_id   ----+---------+     |    loan_type       |
  |    account_type    |               |    principal_amount|
  |    balance         |               |    interest_rate   |
  |    account_status  |               |    tenure_months   |
  +--------------------+               |    loan_status     |
         |         |                   |    outstanding_amt |
         |         | (1:N)             +--------------------+
   (1:N) |         +------------------------------+
         v                                        v
  +---------------------------------------------------------+
  |                    BANK_TRANSACTIONS                    |
  +---------------------------------------------------------+
  | PK transaction_id                                       |
  |    transaction_reference (Shared across transfer legs)  |
  | FK account_id           (Primary Account)               |
  | FK related_account_id   (Counterparty Account)          |
  |    transaction_type     (Deposit, Withdrawal, Transfer) |
  |    amount               (DECIMAL(15,2) > 0)             |
  |    transaction_date     (Audit Timestamp)               |
  |    description          (Narrative)                     |
  |    transaction_status   (Success, Failed)               |
  +---------------------------------------------------------+
```

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Java JDK 21** (or compatible JDK 17+)
2. **Node.js** (v18+) & **npm**
3. **MySQL Server 8.0+** running on `localhost:3306`
4. **Apache Maven 3.9+** (pre-bundled in `tools/apache-maven-3.9.9`)

### Step 1: Initialize Database
Open your MySQL terminal or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS bank_of_bagru_db;
USE bank_of_bagru_db;

-- Run schema and seed scripts
source database/schema.sql;
source database/seed_data.sql;
```

### Step 2: Configure Database Credentials (if different)
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bank_of_bagru_db?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rocky
```

### Step 3: Launch with 1-Click Scripts (Windows)
Double-click:
- **`start_all.bat`**: Automatically starts both the Spring Boot Backend and the React Frontend in separate windows!

Or launch manually:
- **Backend:**
  ```cmd
  run_backend.bat
  ```
  *(Runs on http://localhost:8080)*

- **Frontend:**
  ```cmd
  run_frontend.bat
  ```
  *(Opens on http://localhost:5173)*

---

## 🔑 Demo Login Credentials

The application includes pre-seeded staff logins protected by BCrypt password hashing:

| Username | Password | Full Name | System Role |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | System Administrator | `ROLE_ADMIN` (Full System Access) |
| `teller` | `teller123` | Naveen Kumar | `ROLE_TELLER` (Counter Operations) |
| `manager` | `manager123` | Shweta Sharma | `ROLE_MANAGER` (Loan Underwriting) |

*You can also click the demo credential buttons on the login screen to autofill.*

---

## 📬 Postman REST API Testing

An importable Postman collection is provided in `docs/POSTMAN_COLLECTION.json`.

Major endpoints:
- `POST /api/auth/login` — Authenticate employee
- `GET  /api/dashboard/stats` — Aggregate metrics
- `GET  /api/customers` — Search & list customers
- `POST /api/customers` — Register new customer
- `GET  /api/accounts` — Filter & list accounts
- `POST /api/accounts` — Open new account
- `POST /api/transactions/deposit` — Cash deposit
- `POST /api/transactions/withdraw` — Cash withdrawal
- `POST /api/transactions/transfer` — Atomic fund transfer
- `POST /api/loans/apply` — Apply for loan facility
- `PATCH /api/loans/{id}/approve` — Approve pending loan
- `POST /api/loans/{id}/repay` — Partial/full loan repayment
- `GET  /api/reports/statement/{id}` — Generate account statement
- `GET  /api/database-info/schema` — INFORMATION_SCHEMA columns
- `GET  /api/database-info/demo-query?key=...` — Live SQL query runner

---

## 📁 Repository Directory Structure

```
d:\3rd Sem Study\RDBMS\
├── backend/                        # Spring Boot 3.3.4 Backend
│   ├── pom.xml                     # Maven project configuration
│   ├── src/main/java/com/bankofbagru/
│   │   ├── config/                 # SecurityConfig, WebConfig (CORS)
│   │   ├── controller/             # 9 REST Controllers
│   │   ├── dto/                    # Request/Response Data Transfer Objects
│   │   ├── entity/                 # 6 JPA Entities mapping MySQL tables
│   │   ├── exception/              # GlobalExceptionHandler & custom exceptions
│   │   ├── repository/             # 6 Spring Data JPA Repositories
│   │   └── service/                # Transactional Banking Services
│   └── src/main/resources/
│       └── application.properties  # Database connection & JPA config
├── frontend/                       # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/             # Navbar, Sidebar, Modal, Toast, StatCard
│   │   ├── pages/                  # 8 Full Fintech Application Pages
│   │   ├── services/api.js         # Axios API client
│   │   ├── App.jsx                 # Router & Authentication State
│   │   └── index.css               # Tailwind & Design tokens
│   ├── package.json
│   └── vite.config.js
├── database/                       # MySQL Relational Scripts
│   ├── schema.sql                  # DDL Script: 6 Normalized Tables & Constraints
│   └── seed_data.sql               # DML Script: Branches, Customers, Accounts, Loans
├── docs/                           # Academic Project Documentation
│   ├── RDBMS_PROJECT_REPORT.md     # Formal 3rd Sem Evaluation Report
│   ├── DATABASE_SCHEMA.md          # Full Data Dictionary
│   ├── ER_DIAGRAM.md               # Mermaid Entity Relationship Diagram
│   └── POSTMAN_COLLECTION.json     # Importable Postman Test Suite
├── run_backend.bat                 # 1-Click Backend Launcher
├── run_frontend.bat                # 1-Click Frontend Launcher
├── start_all.bat                   # 1-Click Concurrent Launcher
└── README.md                       # Main Project Documentation
```

---

## 🎓 Academic Evaluation Highlights

1. **Pure RDBMS Focus:** No mock data. Every feature is powered by SQL queries executed in MySQL 8.
2. **ACID Compliance Demonstrated:** Dual-entry transfer logic with deterministic row locking and transaction rollback.
3. **Storage Engine Integrity:** Domain rules enforced at the MySQL storage engine level (`CHECK balance >= 0`, `CHECK amount > 0`).
4. **Third Normal Form (3NF):** Complete elimination of insertion, deletion, and update anomalies.
5. **Interactive Demonstration in UI:** Dedicated "Database Information" page in the application enabling teachers/examiners to run live SQL queries during viva/presentation!
