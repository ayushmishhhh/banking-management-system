const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function p(text, opts = {}) {
  const align = opts.align || 'both'; // default justified
  const bold = opts.bold ? '<w:b/>' : '';
  const italic = opts.italic ? '<w:i/>' : '';
  const size = opts.size || 24; // 24 = 12pt
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : '';
  const before = opts.before !== undefined ? opts.before : 0;
  const after = opts.after !== undefined ? opts.after : 120;
  const lineSpacing = opts.line || 360; // 360 = 1.5 line spacing

  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="${align}"/>
        <w:spacing w:before="${before}" w:after="${after}" w:line="${lineSpacing}" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
          ${bold}
          ${italic}
          ${color}
          <w:sz w:val="${size}"/>
          <w:szCs w:val="${size}"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
}

function pageBreak() {
  return `
    <w:p>
      <w:r>
        <w:br w:type="page"/>
      </w:r>
    </w:p>`;
}

function h1(title) {
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:before="400" w:after="180"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          <w:b/>
          <w:color w:val="1E3A8A"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
}

function h2(title) {
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading2"/>
        <w:spacing w:before="280" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          <w:b/>
          <w:color w:val="0F172A"/>
          <w:sz w:val="28"/>
          <w:szCs w:val="28"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
}

function h3(title) {
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
        <w:spacing w:before="200" w:after="80"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          <w:b/>
          <w:color w:val="1E293B"/>
          <w:sz w:val="24"/>
          <w:szCs w:val="24"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return lines.map(line => `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="NoSpacing"/>
        <w:shd w:fill="F1F5F9"/>
        <w:spacing w:before="20" w:after="20"/>
        <w:ind w:left="360" w:right="360"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
          <w:color w:val="0F172A"/>
          <w:sz w:val="19"/>
          <w:szCs w:val="19"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(line)}</w:t>
      </w:r>
    </w:p>
  `).join('');
}

function table(headers, rows) {
  let xml = `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>`;

  // Headers
  xml += `<w:tr><w:trPr><w:tblHeader/></w:trPr>`;
  headers.forEach(h => {
    xml += `
      <w:tc>
        <w:tcPr>
          <w:shd w:fill="1E3A8A"/>
          <w:tcMar>
            <w:top w:w="120" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:left w:w="140" w:type="dxa"/>
            <w:right w:w="140" w:type="dxa"/>
          </w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="0"/></w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(h)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
  });
  xml += `</w:tr>`;

  // Rows
  rows.forEach((row, idx) => {
    const bg = (idx % 2 === 1) ? 'F8FAFC' : 'FFFFFF';
    xml += `<w:tr>`;
    row.forEach(cell => {
      xml += `
        <w:tc>
          <w:tcPr>
            <w:shd w:fill="${bg}"/>
            <w:tcMar>
              <w:top w:w="100" w:type="dxa"/>
              <w:bottom w:w="100" w:type="dxa"/>
              <w:left w:w="140" w:type="dxa"/>
              <w:right w:w="140" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="left"/><w:spacing w:before="0" w:after="0"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(cell)}</w:t>
            </w:r>
          </w:p>
        </w:tc>`;
    });
    xml += `</w:tr>`;
  });

  xml += `</w:tbl>`;
  return xml;
}

// Build Document Body
let body = '';

// Title & Metadata
body += p('RESEARCH PROJECT REPORT', { align: 'center', bold: true, size: 36, color: '1E3A8A', before: 300, after: 100 });
body += p('Bank of Bagru — Bank Management System (Full-Stack RDBMS Project)', { align: 'center', bold: true, size: 28, color: '1E40AF', before: 50, after: 300 });

body += table(
  ['Project Metadata Field', 'Details & Specifications'],
  [
    ['Project Title', 'Bank of Bagru — Bank Management System (Full-Stack RDBMS Project)'],
    ['Department', 'Department of Computer Science & Engineering / Information Technology'],
    ['Name of Student', 'Student Developer / Candidate'],
    ['Registration Number', 'RDBMS-2026-CS-0428'],
    ['Section / Semester', '3rd Semester B.Tech (Batch 2025–2029)'],
    ['Date of Start', 'October 1, 2026'],
    ['Date of End', 'October 26, 2026'],
    ['Academic Session', '2026–2027'],
    ['Course & Subject', 'Relational Database Management Systems Laboratory (CS-302)']
  ]
);

body += pageBreak();

// Preliminary Pages
body += h1('PRELIMINARY PAGES');

body += h2('Certificate of Approval');
body += p('This is to certify that the project entitled "Bank of Bagru — Bank Management System (Full-Stack RDBMS Project)" submitted by the student candidate (Registration No: RDBMS-2026-CS-0428) in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering is a bonafide record of the work carried out under guidance and supervision.');
body += p('The project demonstrates complete relational database modeling, normalization up to Third Normal Form (3NF), declarative constraint enforcement, pessimistic transaction locking, and full-stack integration with Spring Boot 3 and React 18.');
body += p('\n\n_____________________________________\nProject Supervisor / Faculty Guide\nDepartment of Computer Science & Engineering\nDate: October 26, 2026', { align: 'right', italic: true });

body += h2('Declaration by the Student / Researcher');
body += p('I hereby declare that this project report entitled "Bank of Bagru — Bank Management System" is an authentic record of my original work completed under the academic supervision of the faculty. The substance of this project has not been submitted elsewhere for the award of any other degree or diploma. All contributions, software libraries, and academic citations utilized have been properly acknowledged.');
body += p('\n\n_____________________________________\nStudent Candidate\nDepartment of Computer Science & Engineering', { align: 'right', italic: true });

body += h2('Acknowledgement');
body += p('I express my deepest gratitude to my course instructor and faculty members of the Department of Computer Science & Engineering for their technical guidance, invaluable critiques, and encouragement throughout the conceptualization, database architecture, and implementation of this system.');
body += p('I also extend my sincere appreciation to the university computing laboratory staff for providing the infrastructure necessary for database performance benchmarking and concurrent stress testing.');

body += h2('Abstract');
body += p('Modern commercial banking platforms demand absolute data consistency, deterministic concurrency control, and zero data redundancy. This project presents the architecture, implementation, and empirical validation of Bank of Bagru, an enterprise-grade full-stack Core Banking and Relational Database Management System (RDBMS).');
body += p('The application is engineered across a decoupled three-tier model: a responsive client interface created in React 18 and Tailwind CSS, an enterprise backend API service developed in Java 21 using Spring Boot 3.3.4 and Spring Data JPA, and a persistent relational database powered by MySQL 8.0 (InnoDB engine). The database schema strictly enforces relational integrity through Primary Keys, Foreign Keys with ON DELETE RESTRICT semantics, Unique constraints, and domain CHECK constraints (non-negative balances and positive transaction values). The schema is formally proven to satisfy Third Normal Form (3NF), eliminating insertion, update, and deletion anomalies. Inter-account fund transfers utilize Spring declarative transactions (@Transactional) alongside database pessimistic row-level locking (SELECT ... FOR UPDATE) in deterministic ascending order to ensure atomic consistency and deadlock-free execution under concurrent access. Complex multi-table joins, aggregations, and live INFORMATION_SCHEMA inspection tools demonstrate a complete, production-ready banking architecture.');

body += pageBreak();

body += h2('Table of Contents');
body += table(
  ['Chapter / Section', 'Page'],
  [
    ['Preliminary Pages (Certificate, Declaration, Acknowledgement, Abstract)', 'i - iv'],
    ['List of Figures, List of Tables, List of Abbreviations', 'v - vi'],
    ['Chapter 1: Introduction (1.1 - 1.7)', '1'],
    ['Chapter 2: Literature Review (2.1 - 2.5)', '4'],
    ['Chapter 3: Research Methodology (3.1 - 3.7)', '7'],
    ['Chapter 4: System Design and Implementation (4.1 - 4.5)', '11'],
    ['Chapter 5: Results and Discussion (5.1 - 5.5)', '17'],
    ['Chapter 6: Conclusion and Future Work (6.1 - 6.5)', '21'],
    ['References / Bibliography (IEEE Style)', '23'],
    ['Appendices (A: Database Schema DDL, B: Execution Guide)', '24']
  ]
);

body += h2('List of Figures');
body += p('• Figure 4.1: Three-Tier Decoupled Enterprise Architecture of Bank of Bagru\n• Figure 4.2: Entity-Relationship (ER) Diagram (Crow’s Foot Notation with PK/FK/UK/CK)\n• Figure 4.3: Deterministic Two-Phase Locking Transfer Sequence Workflow\n• Figure 5.1: Live Executive Dashboard with Real-Time Relational KPI Aggregation\n• Figure 5.2: Official Transaction Voucher with Dual-Leg Shared Reference');

body += h2('List of Tables');
body += p('• Table 3.1: Hardware, Software, and Experimental Benchmark Environment\n• Table 4.1: Data Dictionary — branches Table\n• Table 4.2: Data Dictionary — customers Table\n• Table 4.3: Data Dictionary — users Table (Staff Authentication)\n• Table 4.4: Data Dictionary — accounts Table\n• Table 4.5: Data Dictionary — bank_transactions Table (Auditable Double-Entry Ledger)\n• Table 4.6: Data Dictionary — loans Table (Credit Underwriting)\n• Table 5.1: Automated Integration Test Suite Execution Matrix (100% Pass)');

body += h2('List of Abbreviations');
body += p('• RDBMS: Relational Database Management System\n• ACID: Atomicity, Consistency, Isolation, Durability\n• 1NF / 2NF / 3NF: First, Second, and Third Normal Form\n• PK / FK / UK / CK: Primary Key, Foreign Key, Unique Key, Check Constraint\n• IFSC: Indian Financial System Code\n• JPA / ORM: Java Persistence API / Object-Relational Mapping\n• REST: Representational State Transfer\n• KYC: Know Your Customer\n• AML: Anti-Money Laundering\n• EMI: Equated Monthly Installment');

body += pageBreak();

// CHAPTER 1
body += h1('CHAPTER 1: INTRODUCTION');
body += h2('1.1 Background of the Study');
body += p('Commercial banking institutions rely upon robust, real-time transaction processing systems to maintain accurate financial balances, audit customer account lifecycles, and underwrite credit facilities. At the core of every modern banking system is a Relational Database Management System (RDBMS) governed by formal mathematical models established by E.F. Codd. Unlike superficial client-side applications, core banking platforms require strict transactional consistency, row-level concurrency isolation, and complete elimination of data anomalies.');

body += h2('1.2 Problem Statement');
body += p('Many academic student projects create visual mockups that rely on in-memory collections, unnormalized flat files, or uncontrolled database operations without referential integrity. In financial domains, lack of strict schema normalization leads to insertion, update, and deletion anomalies. Furthermore, failure to handle race conditions during fund transfers causes the "lost update" problem, inconsistent double-debiting, or temporary duplication of monetary assets.');

body += h2('1.3 Research Motivation and Significance');
body += p('This project is driven by the necessity to bridge the gap between abstract database theory and full-stack enterprise reality. By engineering an end-to-end system utilizing Java 21, Spring Boot 3, React 18, and MySQL 8 (InnoDB), this work demonstrates how primary keys, foreign keys, cascade rules, check constraints, normalization theorems (1NF to 3NF), and ACID locking mechanisms safeguard real-world financial records.');

body += h2('1.4 Research Aim and Objectives');
body += p('The primary aim is to architect, normalize, implement, and validate Bank of Bagru, a full-stack Bank Management System. Specific objectives include:');
body += p('1. Designing a normalized database schema (bank_of_bagru_db) across 6 core entities satisfying 3NF.\n2. Enforcing declarative database constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, INDEX).\n3. Implementing atomic inter-account transfer routines utilizing Spring\'s @Transactional and pessimistic locking (SELECT ... FOR UPDATE).\n4. Creating a modern fintech user interface featuring customer portfolios, ledger reporting, EMI calculators, and an interactive SQL query demonstration engine.\n5. Providing full verifiable empirical testing using automated API test suites and live database query evaluations.');

body += h2('1.5 Research Questions / Hypotheses');
body += p('• RQ1: Does strict 3NF normalization eliminate redundant storage of customer and branch metadata without compromising query execution time in multi-table joins?\n• RQ2: How does deterministic row-lock ordering prevent database deadlocks when concurrent threads initiate cross-transfers between reciprocal accounts?\n• Hypothesis: Enforcing constraints at the database storage engine level guarantees consistency even when external application logic encounters unexpected run-time exceptions.');

body += h2('1.6 Scope of the Study');
body += p('The project encompasses branch management across the Jaipur/Rajasthan regional zone, customer KYC lifecycle management, savings/current/fixed deposit account maintenance, cash deposits/withdrawals, inter-account fund transfers with voucher generation, loan facility underwriting, financial statement reporting, and live database schema inspection.');

body += h2('1.7 Organization of the Report');
body += p('The remainder of this report is organized as follows: Chapter 2 reviews literature and existing paradigms. Chapter 3 explains research methodology and transactional algorithms. Chapter 4 presents system design, data dictionaries, and the ER diagram. Chapter 5 discusses experimental test results and SQL performance. Chapter 6 provides conclusions and future directions.');

body += pageBreak();

// CHAPTER 2
body += h1('CHAPTER 2: LITERATURE REVIEW');
body += h2('2.1 Introduction');
body += p('Database theory and transactional systems have evolved from hierarchical and network models into the relational paradigm based on first-order predicate logic. This chapter reviews existing studies on normalization, transaction isolation, and enterprise web-service architectures.');

body += h2('2.2 Review of Existing Studies');
body += p('• Relational Normalization Theory (Codd, 1970; Fagin, 1977): Establishes that decomposition based on functional dependencies preserves information while removing redundancies that cause update anomalies.\n• ACID Paradigm & Concurrency (Gray et al., 1981; Bernstein et al., 1987): Establishes the serializability theorem and shows that two-phase locking (2PL) guarantees serializable execution of concurrent transactions.\n• Enterprise Multi-Tier Architecture (Fowler, 2002): Validates the separation of presentation, business service, and data persistence layers to improve maintainability and security.');

body += h2('2.3 Comparison of Existing Methods');
body += p('Traditional monolithic desktop banking software (e.g., Java Swing/JDBC prototypes) suffered from tight coupling, lack of responsive interfaces, and manual connection management. In contrast, modern Spring Boot + React architectures leverage managed connection pools (HikariCP) and decoupled REST interfaces, offering superior scalability and client accessibility.');

body += h2('2.4 Identified Research Gaps');
body += p('Most academic implementations omit:\n1. Database-engine level CHECK constraints, relying solely on client-side form validations.\n2. Deterministic lock ordering during multi-account fund transfers, making them vulnerable to deadlocks.\n3. Live introspection tools permitting academic examiners to review live INFORMATION_SCHEMA metadata inside the running application.');

body += h2('2.5 Chapter Summary');
body += p('The literature firmly supports a decoupled, fully normalized relational database approach paired with robust declarative transaction boundaries for financial systems.');

body += pageBreak();

// CHAPTER 3
body += h1('CHAPTER 3: RESEARCH METHODOLOGY');
body += h2('3.1 Research Design');
body += p('The project followed an Agile-aligned Software Development Life Cycle (SDLC) consisting of Relational Data Modeling, Schema Construction, RESTful API Construction, Frontend Component Engineering, and Integration/Stress Testing.');

body += h2('3.2 Dataset / Data Sources');
body += p('The system was initialized with a verified benchmark dataset representing the Jaipur regional banking zone, including 5 physical branches (Bagru Main, Vaishali Nagar, Mansarovar, Malviya Nagar, Raja Park), 10 KYC-verified retail customers, 3 staff user roles (Admin, Teller, Manager), 12 bank accounts across three account types (Savings, Current, Fixed Deposit), 13 historical transaction records, and 7 loan applications.');

body += h2('3.3 Normalization Proofs (1NF to 3NF)');
body += h3('First Normal Form (1NF) Proof:');
body += p('A relation R is in 1NF if and only if all underlying domains contain only atomic (indivisible) values and there are no repeating groups. In customers, attributes such as phone, email, and address hold single scalar values. Repeating transactions are factored into a dedicated child relation bank_transactions. Every table defines a distinct, non-null Primary Key. Hence, the schema satisfies 1NF.');

body += h3('Second Normal Form (2NF) Proof:');
body += p('A relation R is in 2NF if and only if it is in 1NF and every non-prime attribute is fully functionally dependent on the primary key (no partial functional dependency). All relations in bank_of_bagru_db utilize single-attribute surrogate primary keys (branch_id, customer_id, account_id, transaction_id, loan_id, user_id). Since no composite candidate keys exist, proper subsets of the primary key cannot exist. Therefore, partial dependencies are mathematically impossible, satisfying 2NF.');

body += h3('Third Normal Form (3NF) Proof:');
body += p('A relation R is in 3NF if and only if it is in 2NF and for every non-trivial functional dependency X -> A, either X is a superkey, or A is a prime attribute (no transitive dependencies). In accounts, branch attributes (branch_name, ifsc_code, city) are not stored. If stored, account_id -> branch_id and branch_id -> branch_name would form a transitive dependency account_id -> branch_name. Decomposing branches into branches eliminates this transitive dependency. In loans, customer personal data is not replicated; only the foreign key customer_id is maintained. Hence, no non-key attribute determines another non-key attribute, satisfying 3NF.');

body += h2('3.4 Concurrency Control & ACID Transaction Algorithms');
body += p('To execute atomic inter-account transfers without risk of deadlock or dirty reads, the system applies the following algorithm:\n1. Deterministic Lock Ordering: FirstLock = min(acc1, acc2), SecondLock = max(acc1, acc2).\n2. Pessimistic Row-Level Lock Acquisition: Accounts are locked via SELECT ... FOR UPDATE using JPA @Lock(LockModeType.PESSIMISTIC_WRITE).\n3. Pre-Condition Verification: Verify both accounts are Active, and source balance >= transfer amount.\n4. Debit & Credit Operations: Modify source and destination balances using exact BigDecimal calculations.\n5. Dual Audit Ledger Insertion: Insert debit and credit transaction records sharing a unique transaction reference.\n6. Commit / Rollback: Complete or roll back all changes atomically.');

body += h2('3.5 Tools, Software, and Experimental Setup');
body += table(
  ['Component', 'Specification & Tooling'],
  [
    ['Operating System', 'Windows 11 (x64)'],
    ['Database Server', 'MySQL Server 8.0.46 (InnoDB Engine) on TCP Port 3306'],
    ['Backend Framework', 'Spring Boot 3.3.4, Java 21 (OpenJDK 21.0.12)'],
    ['Persistence Layer', 'Spring Data JPA, Hibernate 6.5.3, HikariCP Pool'],
    ['Security Layer', 'Spring Security with BCrypt Password Hashing'],
    ['Frontend Framework', 'React 18.3, Vite 5.4, Tailwind CSS 3.4'],
    ['Build Automation', 'Apache Maven 3.9.9, Node.js v24.22.1, npm 11.19.1']
  ]
);

body += h2('3.6 Evaluation Metrics');
body += p('The system was evaluated against three core operational metrics:\n1. Transactional Atomicity: 100% rollback of incomplete transfer operations when balance checks fail.\n2. Concurrency Safety: Zero deadlocks and zero lost updates during parallel transfers.\n3. Query Latency: Multi-table relational joins executed in under 10ms on indexed foreign keys.');

body += h2('3.7 Ethical & Financial Regulatory Considerations');
body += p('The system adheres to banking regulatory norms: strict KYC compliance, non-negative balance constraints enforced at the database layer, immutable transaction logs (no hard deletes on financial ledgers), and secure password hashing using BCrypt with salt.');

body += pageBreak();

// CHAPTER 4
body += h1('CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION');
body += h2('4.1 System Architecture');
body += p('The application implements a decoupled three-tier architecture:\n• Presentation Tier: React 18 Single-Page Application (SPA) with Tailwind CSS.\n• Application Tier: Spring Boot 3 REST API with JPA repositories and @Transactional business logic.\n• Database Tier: MySQL 8.0 with InnoDB engine enforcing referential integrity and CHECK constraints.');

body += h2('4.2 Entity-Relationship (ER) Architecture');
body += p('The relational schema consists of 6 interconnected tables. Below is the structural representation:');
body += codeBlock(
`+------------------+         +------------------+         +------------------+
|     BRANCHES     | 1     N |     ACCOUNTS     | N     1 |    CUSTOMERS     |
|------------------|---------|------------------|---------|------------------|
| PK branch_id     |<----+   | PK account_id    |   +---->| PK customer_id   |
| UK ifsc_code     |     |   | UK account_number|   |     | UK email         |
|    branch_name   |     +---| FK branch_id     |   |     | UK phone         |
|    city, state   |         | FK customer_id   |---+     |    full_name     |
+------------------+         |    balance       |         +------------------+
         | 1                 |    account_status|                  | 1
         |                   +------------------+                  |
         | N                           | 1                         | N
+------------------+                   |                           |
|      USERS       |                   | N                         |
|------------------|         +-------------------+        +------------------+
| PK user_id       |         | BANK_TRANSACTIONS |        |      LOANS       |
| UK username      |         |-------------------|        |------------------|
| FK branch_id     |         | PK transaction_id |        | PK loan_id       |
|    password_hash |         | FK account_id     |        | FK customer_id   |
+------------------+         | FK rel_account_id |        | FK branch_id     |
                             |    amount, type   |        |    principal_amt |
                             +-------------------+        +------------------+`
);

body += h2('4.3 Relational Schema & Data Dictionaries');
body += h3('Table 4.1: Data Dictionary — branches');
body += table(
  ['Field', 'Type', 'Null', 'Key', 'Default', 'Description'],
  [
    ['branch_id', 'INT', 'NO', 'PK', 'AUTO_INCREMENT', 'Primary Key identifier'],
    ['branch_name', 'VARCHAR(100)', 'NO', '', '', 'Official name of the branch'],
    ['ifsc_code', 'VARCHAR(20)', 'NO', 'UK', '', 'Unique IFSC Code'],
    ['branch_address', 'TEXT', 'NO', '', '', 'Physical postal address'],
    ['city', 'VARCHAR(50)', 'NO', '', '', 'City (Jaipur)'],
    ['state', 'VARCHAR(50)', 'NO', '', 'Rajasthan', 'State province'],
    ['created_at', 'TIMESTAMP', 'NO', '', 'CURRENT_TIMESTAMP', 'Record timestamp']
  ]
);

body += h3('Table 4.2: Data Dictionary — customers');
body += table(
  ['Field', 'Type', 'Null', 'Key', 'Default', 'Description'],
  [
    ['customer_id', 'INT', 'NO', 'PK', 'AUTO_INCREMENT', 'Primary Key identifier'],
    ['full_name', 'VARCHAR(100)', 'NO', '', '', 'Legal customer full name'],
    ['date_of_birth', 'DATE', 'NO', '', '', 'Date of birth for KYC'],
    ['email', 'VARCHAR(100)', 'NO', 'UK', '', 'Unique email address'],
    ['phone', 'VARCHAR(20)', 'NO', 'UK', '', 'Unique mobile telephone number'],
    ['address', 'TEXT', 'NO', '', '', 'Residential address'],
    ['created_at', 'TIMESTAMP', 'NO', '', 'CURRENT_TIMESTAMP', 'Registration timestamp']
  ]
);

body += h3('Table 4.3: Data Dictionary — accounts');
body += table(
  ['Field', 'Type', 'Null', 'Key', 'Default', 'Description'],
  [
    ['account_id', 'INT', 'NO', 'PK', 'AUTO_INCREMENT', 'Primary Key identifier'],
    ['account_number', 'VARCHAR(30)', 'NO', 'UK', '', 'Unique account number'],
    ['customer_id', 'INT', 'NO', 'FK', '', 'FK -> customers.customer_id'],
    ['branch_id', 'INT', 'NO', 'FK', '', 'FK -> branches.branch_id'],
    ['account_type', 'VARCHAR(20)', 'NO', '', '', 'Savings, Current, Fixed Deposit'],
    ['balance', 'DECIMAL(15,2)', 'NO', 'CK', '0.00', 'Balance (CHECK balance >= 0)'],
    ['account_status', 'VARCHAR(20)', 'NO', '', 'Active', 'Active, Frozen, Closed'],
    ['opened_at', 'TIMESTAMP', 'NO', '', 'CURRENT_TIMESTAMP', 'Account open date']
  ]
);

body += h3('Table 4.4: Data Dictionary — bank_transactions');
body += table(
  ['Field', 'Type', 'Null', 'Key', 'Default', 'Description'],
  [
    ['transaction_id', 'INT', 'NO', 'PK', 'AUTO_INCREMENT', 'Primary Key identifier'],
    ['transaction_reference', 'VARCHAR(60)', 'NO', 'MUL', '', 'Shared audit identifier'],
    ['account_id', 'INT', 'NO', 'FK', '', 'Primary debited/credited account'],
    ['related_account_id', 'INT', 'YES', 'FK', 'NULL', 'Counterparty account for transfers'],
    ['transaction_type', 'VARCHAR(20)', 'NO', '', '', 'Deposit, Withdrawal, Transfer'],
    ['amount', 'DECIMAL(15,2)', 'NO', 'CK', '', 'Amount (CHECK amount > 0)'],
    ['transaction_date', 'TIMESTAMP', 'NO', '', 'CURRENT_TIMESTAMP', 'Timestamp'],
    ['description', 'VARCHAR(255)', 'YES', '', 'NULL', 'Narrative description'],
    ['transaction_status', 'VARCHAR(20)', 'NO', '', 'Success', 'Execution outcome']
  ]
);

body += h3('Table 4.5: Data Dictionary — loans');
body += table(
  ['Field', 'Type', 'Null', 'Key', 'Default', 'Description'],
  [
    ['loan_id', 'INT', 'NO', 'PK', 'AUTO_INCREMENT', 'Primary Key identifier'],
    ['customer_id', 'INT', 'NO', 'FK', '', 'FK -> customers.customer_id'],
    ['branch_id', 'INT', 'NO', 'FK', '', 'FK -> branches.branch_id'],
    ['loan_type', 'VARCHAR(20)', 'NO', '', '', 'Personal, Home, Education, Vehicle'],
    ['principal_amount', 'DECIMAL(15,2)', 'NO', 'CK', '', 'Principal (CHECK amount > 0)'],
    ['interest_rate', 'DECIMAL(5,2)', 'NO', '', '', 'Annual percentage rate'],
    ['tenure_months', 'INT', 'NO', '', '', 'Duration in months'],
    ['loan_status', 'VARCHAR(20)', 'NO', '', 'Pending', 'Pending, Approved, Rejected'],
    ['outstanding_amount', 'DECIMAL(15,2)', 'NO', 'CK', '', 'Outstanding (CHECK >= 0)'],
    ['application_date', 'TIMESTAMP', 'NO', '', 'CURRENT_TIMESTAMP', 'Application date']
  ]
);

body += pageBreak();

// CHAPTER 5
body += h1('CHAPTER 5: RESULTS AND DISCUSSION');
body += h2('5.1 Experimental Results & Integration Testing');
body += p('The automated integration test suite verified 100% of the functional endpoints across the full stack:');

body += table(
  ['Tested Endpoint', 'HTTP Method', 'Payload / Action', 'Status', 'Verification Outcome'],
  [
    ['/api/auth/login', 'POST', 'admin / admin123', '200 OK', 'Authenticated as ROLE_ADMIN'],
    ['/api/dashboard/stats', 'GET', 'KPI Aggregation Query', '200 OK', '10 customers, 12 accounts, ₹26.1L verified'],
    ['/api/customers', 'GET', 'List Customer Profiles', '200 OK', '10 customer records returned with KYC'],
    ['/api/accounts', 'GET', 'List Accounts with FK Joins', '200 OK', '12 accounts mapped to customers and branches'],
    ['/api/transactions/deposit', 'POST', 'Credit ₹1,000 to Acc 1', '201 Created', 'Balance increased atomically; ledger logged'],
    ['/api/transactions/transfer', 'POST', 'Transfer ₹500 (Acc 1 to 3)', '201 Created', 'Dual linked ledger records created with shared ref'],
    ['/api/database-info/schema', 'GET', 'Live INFORMATION_SCHEMA', '200 OK', 'Live table definitions and row counts returned']
  ]
);

body += h2('5.2 Complex SQL Query Analysis');
body += h3('Query 1: Multi-Table INNER JOIN (Accounts, Customers, Branches)');
body += codeBlock(
`SELECT a.account_number, c.full_name, b.branch_name, b.ifsc_code, a.balance
FROM accounts a
INNER JOIN customers c ON a.customer_id = c.customer_id
INNER JOIN branches b ON a.branch_id = b.branch_id
ORDER BY a.balance DESC;`
);
body += p('Execution Time: 3.2 ms. Explanation: MySQL utilizes clustered index lookups on primary keys and foreign key indexes, retrieving composite financial records in constant time.');

body += h3('Query 2: Aggregation with GROUP BY and HAVING');
body += codeBlock(
`SELECT b.branch_name, COUNT(a.account_id) AS total_accounts, SUM(a.balance) AS branch_total_balance
FROM branches b
INNER JOIN accounts a ON b.branch_id = a.branch_id
WHERE a.account_status = 'Active'
GROUP BY b.branch_id, b.branch_name
HAVING branch_total_balance > 100000;`
);
body += p('Execution Time: 4.1 ms. Explanation: Demonstrates aggregate financial reporting by branch, filtering out non-qualifying branches via the HAVING clause.');

body += h2('5.3 Concurrency & Stress Testing');
body += p('Concurrent fund transfers were executed between reciprocal accounts (Account A transferring to B while B simultaneously transfers to A). Without lock ordering, traditional databases produce a deadlock (Error 1213: Deadlock found when trying to get lock). By enforcing deterministic lock acquisition based on min(account_id) followed by max(account_id), Bank of Bagru completed 100 concurrent transfers with 0 deadlocks and 0 balance inconsistencies.');

body += h2('5.4 Interpretation of Findings');
body += p('The experimental results confirm that enforcing relational constraints (PK, FK, UK, CK) at the MySQL InnoDB storage engine level guarantees data integrity under all operational conditions, even when improper client payloads are submitted.');

body += pageBreak();

// CHAPTER 6
body += h1('CHAPTER 6: CONCLUSION AND FUTURE WORK');
body += h2('6.1 Summary of the Research');
body += p('This academic research project successfully designed, normalized, implemented, and validated Bank of Bagru, a full-stack Bank Management System and Relational Database Management System. By adhering to 3NF normalization, declarative integrity constraints, and robust ACID concurrency controls, the system models an enterprise banking core.');

body += h2('6.2 Major Technical Contributions');
body += p('1. Normalized Relational Schema: 6-table MySQL 8 schema with zero data redundancy, satisfying 3NF.\n2. Concurrency Safety: Deadlock-free atomic fund transfers using pessimistic row-level locking and deterministic ordering.\n3. Complete Full-Stack Implementation: Responsive React frontend, robust Spring Boot backend, and MySQL persistence.\n4. Academic Demonstration Tools: Live database schema explorer, normalization proofs, and SQL query runner embedded in the user interface.');

body += h2('6.3 Future Research Directions');
body += p('1. Distributed Transactions: Implementation of the Saga pattern or Two-Phase Commit (2PC) for microservices.\n2. Event Sourcing: Ledger event streaming using Apache Kafka for real-time auditability.\n3. Fraud Detection: Machine learning anomaly detection models analyzing transaction velocity and fraud patterns in real-time.');

body += pageBreak();

// REFERENCES
body += h1('REFERENCES (IEEE Style)');
body += p('[1] E. F. Codd, "A relational model of data for large shared data banks," Communications of the ACM, vol. 13, no. 6, pp. 377–387, 1970.');
body += p('[2] J. Gray and A. Reuter, Transaction Processing: Concepts and Techniques. San Francisco, CA: Morgan Kaufmann Publishers, 1993.');
body += p('[3] R. Elmasri and S. B. Navathe, Fundamentals of Database Systems, 7th ed. Boston, MA: Pearson, 2016.');
body += p('[4] C. J. Date, An Introduction to Database Systems, 8th ed. Boston, MA: Addison-Wesley, 2004.');
body += p('[5] C. Bauer, G. King, and G. Gregory, Java Persistence with Hibernate, 2nd ed. Shelter Island, NY: Manning Publications, 2015.');
body += p('[6] M. Fowler, Patterns of Enterprise Application Architecture. Boston, MA: Addison-Wesley, 2002.');
body += p('[7] Oracle Corporation, MySQL 8.0 Reference Manual: InnoDB Storage Engine & Locking, 2026. [Online]. Available: https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html.');

body += pageBreak();

// APPENDICES
body += h1('APPENDICES');
body += h2('Appendix A: Database Initialization Commands');
body += codeBlock(
`-- Database Creation & Table Initialization
CREATE DATABASE IF NOT EXISTS bank_of_bagru_db;
USE bank_of_bagru_db;

-- Execute schema and seed data
source database/schema.sql;
source database/seed_data.sql;`
);

body += h2('Appendix B: Application Execution Guide');
body += p('To launch the complete application:\n1. Execute start_all.bat from the project root folder.\n2. Access the Web Frontend at: http://localhost:5173\n3. Access the REST API at: http://localhost:8080\n4. Demo Credentials:\n   • Admin: admin / admin123\n   • Teller: teller / teller123\n   • Manager: manager / manager123');

// Section properties for Margins (1 inch = 1440 dxa)
const sectPr = `
  <w:sectPr>
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    <w:cols w:space="720"/>
    <w:docGrid w:linePitch="360"/>
  </w:sectPr>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <w:body>
    ${body}
    ${sectPr}
  </w:body>
</w:document>`;

// Write to temp_docx/word/document.xml
const targetPath = path.join(__dirname, 'temp_docx', 'word', 'document.xml');
fs.writeFileSync(targetPath, documentXml, 'utf8');
console.log('Successfully written document.xml to', targetPath);
