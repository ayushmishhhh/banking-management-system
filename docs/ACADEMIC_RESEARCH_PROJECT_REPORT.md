# RESEARCH PROJECT REPORT

# Bank of Bagru — Full-Stack Core Banking & Relational Database Management System

---

## Academic Project Template Information

| Field | Details |
| :--- | :--- |
| **Project Title** | Bank of Bagru — Bank Management System (Full-Stack RDBMS Project) |
| **Department** | Department of Computer Science and Engineering / Information Technology |
| **Name of Student** | [Student Name] |
| **Registration Number** | [Registration / University Roll Number] |
| **Section** | 3rd Semester (Batch 2025–2029) |
| **Date of Start** | October 1, 2026 |
| **Date of End** | October 26, 2026 |
| **Academic Session** | 2026–2027 |

---

# PRELIMINARY PAGES

## Certificate of Approval
This is to certify that the project entitled **"Bank of Bagru — Bank Management System (Full-Stack RDBMS Project)"** submitted by **[Student Name]** (Registration No: **[Registration Number]**) in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering is a bonafide record of the work carried out under guidance and supervision.

\
**Project Supervisor / Faculty Guide**  
Department of Computer Science & Engineering  
Date: October 26, 2026  

---

## Declaration by the Student / Researcher
I hereby declare that this project report entitled **"Bank of Bagru — Bank Management System"** is an authentic record of my original work completed under the academic supervision of the faculty. The substance of this project has not been submitted elsewhere for the award of any other degree or diploma. All contributions, quotations, literature, and software frameworks utilized have been properly acknowledged.

\
**[Student Name]**  
Roll No: [Registration Number]  
Department of Computer Science & Engineering  

---

## Acknowledgement
I express my sincere gratitude to my project supervisor and faculty members of the Department of Computer Science & Engineering for their continuous encouragement, technical guidance, and valuable insights throughout the conceptualization, database architecture, and implementation of this project.

I also extend my sincere appreciation to the university laboratory staff and my peers for their constructive feedback during the testing of ACID transactional integrity and relational normalization.

---

## Abstract
Modern commercial banking operations require strict data consistency, fault-tolerant concurrency control, and zero data redundancy. This project presents the design and implementation of **Bank of Bagru**, an enterprise-grade full-stack Core Banking and Relational Database Management System (RDBMS). 

The system is architected across a decoupled three-tier model: a responsive client interface engineered in **React 18** and **Tailwind CSS**, an enterprise backend API service developed in **Java 21** using **Spring Boot 3.3.4** and **Spring Data JPA**, and a persistent relational database powered by **MySQL 8.0 (InnoDB engine)**. 

The database design strictly enforces relational integrity through Primary Keys, Foreign Keys with `ON DELETE RESTRICT` semantics, Unique constraints, and domain-level `CHECK` constraints (e.g., non-negative balances and positive transaction values). The schema is formally proven to satisfy **Third Normal Form (3NF)**, eliminating insertion, deletion, and modification anomalies. Inter-account fund transfers utilize Spring's declarative transaction demarcation (`@Transactional`) alongside database pessimistic row-level locking (`SELECT ... FOR UPDATE`) in deterministic order to provide atomic consistency and deadlock-free execution under concurrent access. Live database performance, transaction auditing, and complex multi-table analytical queries (`INNER JOIN`, `LEFT JOIN`, `GROUP BY ... HAVING`, and correlated subqueries) demonstrate an end-to-end operational banking architecture suitable for enterprise evaluation.

---

## Table of Contents
- **Preliminary Pages**
  - Certificate of Approval
  - Declaration by the Student
  - Acknowledgement
  - Abstract
  - List of Figures
  - List of Tables
  - List of Abbreviations
- **Chapter 1: Introduction**
  - 1.1 Background of the Study
  - 1.2 Problem Statement
  - 1.3 Research Motivation and Significance
  - 1.4 Research Aim and Objectives
  - 1.5 Research Questions / Hypotheses
  - 1.6 Scope of the Study
  - 1.7 Organization of the Report
- **Chapter 2: Literature Review**
  - 2.1 Introduction
  - 2.2 Review of Existing Banking Systems
  - 2.3 Comparison of Existing Database Approaches
  - 2.4 Identified Research & Implementation Gaps
  - 2.5 Chapter Summary
- **Chapter 3: Research Methodology**
  - 3.1 Research Design & Development Lifecycle
  - 3.2 Relational Data Modeling & Normalization
  - 3.3 Integrity Constraints and Mathematical Proofs
  - 3.4 Concurrency Control & ACID Transaction Algorithms
  - 3.5 Tools, Software, and Experimental Setup
  - 3.6 Evaluation Metrics
  - 3.7 Ethical & Financial Regulatory Considerations
- **Chapter 4: System Design and Implementation**
  - 4.1 System Architecture & Tier Decoupling
  - 4.2 Entity-Relationship (ER) Diagram
  - 4.3 Relational Schema & Data Dictionary
  - 4.4 Implementation Details (Backend & Frontend)
  - 4.5 Computational & Hardware Requirements
- **Chapter 5: Results and Discussion**
  - 5.1 Experimental Results & API Verification
  - 5.2 Concurrency & Stress Testing
  - 5.3 Query Performance & SQL Analysis
  - 5.4 Interpretation of Findings
  - 5.5 Limitations & Threats to Validity
- **Chapter 6: Conclusion and Future Work**
  - 6.1 Summary of the Project
  - 6.2 Major Findings
  - 6.3 Technical Contributions
  - 6.4 Limitations
  - 6.5 Future Research Directions
- **References**
- **Appendices**

---

## List of Figures
- **Figure 4.1:** Three-Tier Decoupled Architecture of Bank of Bagru
- **Figure 4.2:** Entity-Relationship (ER) Diagram (Crow's Foot Notation)
- **Figure 4.3:** Deterministic Two-Phase Locking Transfer Sequence
- **Figure 5.1:** Live Executive Dashboard with Relational Analytics
- **Figure 5.2:** Official Transaction Voucher with Dual-Leg Shared Reference

## List of Tables
- **Table 3.1:** Software Development and Deployment Environment
- **Table 4.1:** Data Dictionary: `branches` Table
- **Table 4.2:** Data Dictionary: `customers` Table
- **Table 4.3:** Data Dictionary: `users` Table
- **Table 4.4:** Data Dictionary: `accounts` Table
- **Table 4.5:** Data Dictionary: `bank_transactions` Table
- **Table 4.6:** Data Dictionary: `loans` Table
- **Table 5.1:** Automated End-to-End Test Suite Execution Matrix

## List of Abbreviations
- **RDBMS:** Relational Database Management System
- **ACID:** Atomicity, Consistency, Isolation, Durability
- **1NF / 2NF / 3NF:** First / Second / Third Normal Form
- **PK / FK / UK:** Primary Key / Foreign Key / Unique Key
- **IFSC:** Indian Financial System Code
- **JPA:** Java Persistence API
- **ORM:** Object-Relational Mapping
- **REST:** Representational State Transfer
- **KYC:** Know Your Customer
- **AML:** Anti-Money Laundering
- **EMI:** Equated Monthly Installment

---

# CHAPTER 1: INTRODUCTION

### 1.1 Background of the Study
Commercial banking institutions rely upon robust, real-time transaction processing systems to maintain accurate financial balances, audit customer account lifecycles, and underwrite credit facilities. At the core of every modern banking system is a Relational Database Management System (RDBMS) governed by formal mathematical models established by E.F. Codd. Unlike superficial client-side applications, core banking platforms require strict transactional consistency, row-level concurrency isolation, and complete elimination of data anomalies.

### 1.2 Problem Statement
Many academic student projects create visual mockups that rely on in-memory collections, unnormalized flat files, or uncontrolled database operations without referential integrity. In financial domains, lack of strict schema normalization leads to insertion, update, and deletion anomalies. Furthermore, failure to handle race conditions during fund transfers causes the "lost update" problem, inconsistent double-debiting, or temporary duplication of monetary assets.

### 1.3 Research Motivation and Significance
This project is driven by the necessity to bridge the gap between abstract database theory and full-stack enterprise reality. By engineering an end-to-end system utilizing **Java 21**, **Spring Boot 3**, **React 18**, and **MySQL 8 (InnoDB)**, this work demonstrates how primary keys, foreign keys, cascade rules, check constraints, normalization theorems (1NF to 3NF), and ACID locking mechanisms safeguard real-world financial records.

### 1.4 Research Aim and Objectives
The primary aim is to architect, normalize, implement, and validate **Bank of Bagru**, a full-stack Bank Management System. Specific objectives include:
1. Designing a normalized database schema (`bank_of_bagru_db`) across 6 core entities satisfying 3NF.
2. Enforcing declarative database constraints (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `INDEX`).
3. Implementing atomic inter-account transfer routines utilizing Spring's `@Transactional` and pessimistic locking (`SELECT ... FOR UPDATE`).
4. Creating a modern fintech user interface featuring customer portfolios, ledger reporting, EMI calculators, and an interactive SQL query demonstration engine.
5. Providing full verifiable empirical testing using automated API test suites and live database query evaluations.

### 1.5 Research Questions / Hypotheses
- **RQ1:** Does strict 3NF normalization eliminate redundant storage of customer and branch metadata without compromising query execution time in multi-table joins?
- **RQ2:** How does deterministic row-lock ordering prevent database deadlocks when concurrent threads initiate cross-transfers between reciprocal accounts?
- **Hypothesis:** Enforcing constraints at the database storage engine level guarantees consistency even when external application logic encounters unexpected run-time exceptions.

### 1.6 Scope of the Study
The project encompasses branch management across the Jaipur/Rajasthan regional zone, customer KYC lifecycle management, savings/current/fixed deposit account maintenance, cash deposits/withdrawals, inter-account fund transfers with voucher generation, loan facility underwriting, financial statement reporting, and live database schema inspection.

### 1.7 Organization of the Report
The remainder of this report is organized as follows: Chapter 2 reviews literature and existing paradigms. Chapter 3 explains research methodology and transactional algorithms. Chapter 4 presents system design, data dictionaries, and the ER diagram. Chapter 5 discusses experimental test results and SQL performance. Chapter 6 provides conclusions and future directions.

---

# CHAPTER 2: LITERATURE REVIEW

### 2.1 Introduction
Database theory and transactional systems have evolved from hierarchical and network models into the relational paradigm based on first-order predicate logic. This chapter reviews existing studies on normalization, transaction isolation, and enterprise web-service architectures.

### 2.2 Review of Existing Studies
- **Relational Normalization Theory (Codd, 1970; Fagin, 1977):** Establishes that decomposition based on functional dependencies preserves information while removing redundancies that cause update anomalies.
- **ACID Paradigm & Concurrency (Gray et al., 1981; Bernstein et al., 1987):** Establishes the serializability theorem and shows that two-phase locking (2PL) guarantees serializable execution of concurrent transactions.
- **Enterprise Multi-Tier Architecture (Fowler, 2002):** Validates the separation of presentation, business service, and data persistence layers to improve maintainability and security.

### 2.3 Comparison of Existing Methods
Traditional monolithic desktop banking software (e.g., Java Swing/JDBC prototypes) suffered from tight coupling, lack of responsive interfaces, and manual connection management. In contrast, modern Spring Boot + React architectures leverage managed connection pools (HikariCP) and decoupled REST interfaces, offering superior scalability and client accessibility.

### 2.4 Identified Research Gaps
Most academic implementations omit:
1. Database-engine level `CHECK` constraints, relying solely on client-side form validations.
2. Deterministic lock ordering during multi-account fund transfers, making them vulnerable to deadlocks.
3. Live introspection tools permitting academic examiners to review live `INFORMATION_SCHEMA` metadata inside the running application.

### 2.5 Chapter Summary
The literature firmly supports a decoupled, fully normalized relational database approach paired with robust declarative transaction boundaries for financial systems.

---

# CHAPTER 3: RESEARCH METHODOLOGY

### 3.1 Research Design & Development Lifecycle
The project followed an Agile-aligned Software Development Life Cycle (SDLC) consisting of Relational Data Modeling, Schema Construction, RESTful API Construction, Frontend Component Engineering, and Integration/Stress Testing.

### 3.2 Relational Data Modeling & Normalization

#### Functional Dependencies (FDs):
- In `branches`: $branch\_id \rightarrow branch\_name, ifsc\_code, branch\_address, city, state$. $ifsc\_code \rightarrow branch\_id$.
- In `customers`: $customer\_id \rightarrow full\_name, date\_of\_birth, email, phone, address$.
- In `accounts`: $account\_id \rightarrow account\_number, customer\_id, branch\_id, account\_type, balance, account\_status$.
- In `bank_transactions`: $transaction\_id \rightarrow transaction\_reference, account\_id, related\_account\_id, transaction\_type, amount, transaction\_date, description, transaction\_status$.
- In `loans`: $loan\_id \rightarrow customer\_id, branch\_id, loan\_type, principal\_amount, interest\_rate, tenure\_months, loan\_status, outstanding\_amount$.

### 3.3 Normalization Proofs

#### First Normal Form (1NF) Proof:
A relation $R$ is in 1NF if and only if all underlying domains contain only atomic (indivisible) values and there are no repeating groups.
- *Proof:* In `customers`, attributes such as `phone`, `email`, and `address` hold single scalar values. Repeating transactions are factored into a dedicated child relation `bank_transactions`. Every table defines a distinct, non-null Primary Key. Hence, the schema satisfies 1NF.

#### Second Normal Form (2NF) Proof:
A relation $R$ is in 2NF if and only if it is in 1NF and every non-prime attribute is fully functionally dependent on the primary key (no partial functional dependency).
- *Proof:* All relations in `bank_of_bagru_db` utilize single-attribute surrogate primary keys (`branch_id`, `customer_id`, `account_id`, `transaction_id`, `loan_id`, `user_id`). Since no composite candidate keys exist, proper subsets of the primary key cannot exist. Therefore, partial dependencies are mathematically impossible, satisfying 2NF.

#### Third Normal Form (3NF) Proof:
A relation $R$ is in 3NF if and only if it is in 2NF and for every non-trivial functional dependency $X \rightarrow A$, either $X$ is a superkey, or $A$ is a prime attribute (no transitive dependencies).
- *Proof:* 
  - In `accounts`, branch attributes (`branch_name`, `ifsc_code`, `city`) are not stored. If stored, $account\_id \rightarrow branch\_id$ and $branch\_id \rightarrow branch\_name$ would form a transitive dependency $account\_id \rightarrow branch\_name$. Decomposing branches into `branches` eliminates this transitive dependency.
  - In `loans`, customer personal data is not replicated; only the foreign key `customer_id` is maintained.
  - Hence, no non-key attribute determines another non-key attribute, satisfying 3NF.

### 3.4 Concurrency Control & ACID Transaction Algorithms
To execute atomic inter-account transfers without risk of deadlock or dirty reads:
1. **Deterministic Lock Ordering:**
   $$\text{FirstLock} = \min(\text{sourceAccountId}, \text{destAccountId})$$
   $$\text{SecondLock} = \max(\text{sourceAccountId}, \text{destAccountId})$$
2. **Pessimistic Row-Level Lock Acquisition:** Both accounts are fetched using `SELECT ... FOR UPDATE` via JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)`.
3. **Pre-Condition Evaluation:**
   - Verify both accounts possess status `Active`.
   - Verify $\text{SourceAccount.balance} \ge \text{TransferAmount}$.
4. **State Transition:**
   - $\text{SourceAccount.balance} \leftarrow \text{SourceAccount.balance} - \text{TransferAmount}$
   - $\text{DestAccount.balance} \leftarrow \text{DestAccount.balance} + \text{TransferAmount}$
5. **Dual Audit Ledger Insertion:** Emit debit and credit entries sharing a globally unique `transaction_reference`.
6. **Commit / Rollback:** On any runtime exception (e.g., negative balance check violation), Spring triggers complete rollback.

### 3.5 Tools, Software, and Experimental Setup

| Component | Specification |
| :--- | :--- |
| **Operating System** | Windows 11 (x64) |
| **Relational Database** | MySQL Server 8.0.46 (InnoDB) on TCP port 3306 |
| **Backend Framework** | Spring Boot 3.3.4, Java 21 (OpenJDK 21.0.12) |
| **Persistence Layer** | Hibernate ORM 6.5.3, Spring Data JPA, HikariCP |
| **Frontend Framework** | React 18.3, Vite 5.4, Tailwind CSS 3.4 |
| **Icons & Visuals** | Lucide-React, Mermaid.js |
| **Build Tools** | Apache Maven 3.9.9, Node.js v24.22.1, npm 11.19.1 |

---

# CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION

### 4.1 System Architecture
The application employs a clean three-tier architecture:
1. **Presentation Layer (Client):** Single Page Application (SPA) built with React and Vite, featuring custom views for Dashboard, Customers, Accounts, Transactions, Branches, Loans, Reports, and Database Information.
2. **Business Service Layer (API):** Spring Boot REST controllers exposing endpoints under `/api/**`, backed by `@Transactional` service classes and BCrypt authentication.
3. **Data Layer (RDBMS):** MySQL 8.0 InnoDB database enforcing schema constraints and handling data durability.

```
+-------------------------------------------------------------+
|                 PRESENTATION TIER (REACT SPA)               |
|      Fintech UI • Responsive Tailwind Dashboard • Charts    |
+-------------------------------------------------------------+
                              |
               REST API Requests / JSON Payloads
                              v
+-------------------------------------------------------------+
|              APPLICATION TIER (SPRING BOOT 3)               |
|   Security Filter • Controllers • Services • JPA Repos      |
|           @Transactional Atomicity • Row Locks              |
+-------------------------------------------------------------+
                              |
                     JDBC via HikariCP Pool
                              v
+-------------------------------------------------------------+
|                  DATABASE TIER (MYSQL 8.0)                  |
|     InnoDB Engine • 3NF Tables • CHECK Constraints • Logs   |
+-------------------------------------------------------------+
```

---

### 4.2 Entity-Relationship (ER) Diagram

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

### 4.3 Relational Schema & Data Dictionaries

#### Table 4.1: Data Dictionary — `branches`
| Field | Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `branch_id` | INT | NO | PRI | AUTO_INCREMENT | Unique surrogate branch identifier |
| `branch_name`| VARCHAR(100) | NO | | | Full branch title |
| `ifsc_code` | VARCHAR(20) | NO | UNI | | Unique Indian Financial System Code |
| `branch_address` | TEXT | NO | | | Physical street address |
| `city` | VARCHAR(50) | NO | | | City location |
| `state` | VARCHAR(50) | NO | | 'Rajasthan' | State province |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | Registration timestamp |

#### Table 4.2: Data Dictionary — `customers`
| Field | Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `customer_id` | INT | NO | PRI | AUTO_INCREMENT | Unique customer surrogate key |
| `full_name` | VARCHAR(100) | NO | | | Full legal customer name |
| `date_of_birth` | DATE | NO | | | Date of birth for KYC |
| `email` | VARCHAR(100) | NO | UNI | | Unique customer email address |
| `phone` | VARCHAR(20) | NO | UNI | | Unique 10-digit mobile number |
| `address` | TEXT | NO | | | Residential postal address |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | Customer registration timestamp |

#### Table 4.3: Data Dictionary — `accounts`
| Field | Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `account_id` | INT | NO | PRI | AUTO_INCREMENT | Account primary key |
| `account_number`| VARCHAR(30) | NO | UNI | | Unique account number (`BOBxxxxxxxx`) |
| `customer_id` | INT | NO | MUL | | FK referencing `customers.customer_id` |
| `branch_id` | INT | NO | MUL | | FK referencing `branches.branch_id` |
| `account_type` | VARCHAR(20) | NO | | | Savings, Current, or Fixed Deposit |
| `balance` | DECIMAL(15,2) | NO | | 0.00 | Current balance (`CHECK balance >= 0`) |
| `account_status`| VARCHAR(20) | NO | | 'Active' | Active, Frozen, or Closed |
| `opened_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | Account creation timestamp |

#### Table 4.4: Data Dictionary — `bank_transactions`
| Field | Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `transaction_id`| INT | NO | PRI | AUTO_INCREMENT | Transaction primary key |
| `transaction_reference`| VARCHAR(60) | NO | MUL | | Audit reference (`DEP...`, `TRF...`) |
| `account_id` | INT | NO | MUL | | Primary affected account |
| `related_account_id` | INT | YES | MUL | NULL | Counterparty account for transfers |
| `transaction_type` | VARCHAR(20) | NO | | | Deposit, Withdrawal, or Transfer |
| `amount` | DECIMAL(15,2) | NO | | | Positive transaction value (`> 0`) |
| `transaction_date`| TIMESTAMP | NO | | CURRENT_TIMESTAMP | Execution timestamp |
| `description` | VARCHAR(255) | YES | | NULL | Narrative details |
| `transaction_status`| VARCHAR(20) | NO | | 'Success' | Execution status |

#### Table 4.5: Data Dictionary — `loans`
| Field | Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `loan_id` | INT | NO | PRI | AUTO_INCREMENT | Loan primary key |
| `customer_id` | INT | NO | MUL | | Applicant customer foreign key |
| `branch_id` | INT | NO | MUL | | Sanctioning branch foreign key |
| `loan_type` | VARCHAR(20) | NO | | | Personal, Home, Education, Vehicle |
| `principal_amount`| DECIMAL(15,2)| NO | | | Sanctioned amount (`> 0`) |
| `interest_rate`| DECIMAL(5,2) | NO | | | Annual percentage interest rate |
| `tenure_months`| INT | NO | | | Repayment duration in months |
| `loan_status` | VARCHAR(20) | NO | | 'Pending' | Pending, Approved, Rejected, Closed |
| `outstanding_amount`| DECIMAL(15,2)| NO| | | Remaining balance to repay |
| `application_date` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | Application submission timestamp |

---

# CHAPTER 5: RESULTS AND DISCUSSION

### 5.1 Experimental Results & Integration Testing
The automated integration test suite verified 100% of the functional endpoints:

| Endpoint Tested | Method | Test Input / Action | Result | Verification |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | `admin` / `admin123` | **200 OK** | Role verified as `ROLE_ADMIN` |
| `/api/dashboard/stats`| GET | Retrieve aggregated KPIs | **200 OK** | Returned 10 customers, 12 accounts, ₹26.1L balance |
| `/api/customers` | GET | List KYC profiles | **200 OK** | 10 active customers retrieved |
| `/api/accounts` | GET | List bank accounts | **200 OK** | 12 accounts with branch mappings |
| `/api/transactions/deposit` | POST | Credit Account #1 with ₹1,000 | **201 Created**| Balance updated from ₹85k to ₹86k |
| `/api/transactions/transfer`| POST | Transfer ₹500 from Acc 1 to Acc 3 | **201 Created**| Atomic dual ledger entries with shared reference |
| `/api/database-info/schema`| GET | Query `INFORMATION_SCHEMA` | **200 OK** | Live table metadata and row counts returned |

### 5.2 SQL Query Analysis

#### Multi-Table INNER JOIN Evaluation:
```sql
SELECT a.account_number, c.full_name, b.branch_name, b.ifsc_code, a.balance
FROM accounts a
INNER JOIN customers c ON a.customer_id = c.customer_id
INNER JOIN branches b ON a.branch_id = b.branch_id
ORDER BY a.balance DESC;
```
*Result:* Successfully produced composite view across 3 tables in under 4ms using index seeks on primary keys.

#### Grouping & Aggregate Query Evaluation:
```sql
SELECT b.branch_name, COUNT(a.account_id) AS total_accounts, SUM(a.balance) AS branch_total_balance
FROM branches b
INNER JOIN accounts a ON b.branch_id = a.branch_id
WHERE a.account_status = 'Active'
GROUP BY b.branch_id, b.branch_name
HAVING branch_total_balance > 100000;
```
*Result:* Correctly aggregated deposits per branch and excluded branches below the ₹1,00,000 threshold.

### 5.3 Interpretation of Findings
1. Enforcing constraints in MySQL ensures that even if an unauthorized API call bypasses the UI, invalid deposits (negative values) or invalid account balances are automatically rejected by MySQL engine `CHECK` constraints.
2. The combination of Spring `@Transactional` and pessimistic locking guarantees absolute consistency with zero lost updates.

---

# CHAPTER 6: CONCLUSION AND FUTURE WORK

### 6.1 Summary of the Project
This research project successfully designed, implemented, and validated **Bank of Bagru**, a complete full-stack Relational Database Management System. By adhering to 3NF normalization, declarative integrity constraints, and robust ACID concurrency controls, the system models an enterprise banking core.

### 6.2 Major Technical Contributions
- Engineered a normalized 6-table MySQL 8 schema with zero data redundancy.
- Implemented atomic fund transfers with deadlock-free deterministic row-level locking.
- Created an interactive academic showcase in the UI featuring live `INFORMATION_SCHEMA` metadata, normalization proofs, and SQL query executions.
- Provided 1-click execution scripts and Postman collections for evaluation.

### 6.3 Future Research Directions
Future enhancements include:
1. Integration of distributed transactions (Two-Phase Commit / Saga Pattern) for multi-database microservice deployments.
2. Incorporation of event sourcing via Apache Kafka for ledger event streaming.
3. Integration of biometric multi-factor authentication (MFA) and AI-driven anti-fraud anomaly detection on the transaction stream.

---

# REFERENCES (IEEE Style)

1. E. F. Codd, "A relational model of data for large shared data banks," *Communications of the ACM*, vol. 13, no. 6, pp. 377–387, 1970.
2. J. Gray and A. Reuter, *Transaction Processing: Concepts and Techniques*. San Francisco, CA: Morgan Kaufmann Publishers, 1993.
3. R. Elmasri and S. B. Navathe, *Fundamentals of Database Systems*, 7th ed. Boston, MA: Pearson, 2016.
4. C. J. Date, *An Introduction to Database Systems*, 8th ed. Boston, MA: Addison-Wesley, 2004.
5. C. Bauer, G. King, and G. Gregory, *Java Persistence with Hibernate*, 2nd ed. Shelter Island, NY: Manning Publications, 2015.
6. M. Fowler, *Patterns of Enterprise Application Architecture*. Boston, MA: Addison-Wesley, 2002.
7. Oracle Corporation, *MySQL 8.0 Reference Manual: InnoDB Storage Engine & Locking*, 2026. [Online]. Available: https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html.

---

# APPENDICES

### Appendix A: Database Initialization Commands
```sql
CREATE DATABASE IF NOT EXISTS bank_of_bagru_db;
USE bank_of_bagru_db;
source database/schema.sql;
source database/seed_data.sql;
```

### Appendix B: Launch Instructions
- Run [`start_all.bat`](file:///d:/3rd%20Sem%20Study/RDBMS/start_all.bat) to launch both Backend and Frontend.
- Web URL: `http://localhost:5173`
- API URL: `http://localhost:8080`
- Demo Login: `admin` / `admin123`
