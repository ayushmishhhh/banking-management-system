package com.bankofbagru.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DatabaseInfoService {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInfoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getDatabaseSchemaOverview() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Table List and live row counts
        List<Map<String, Object>> tableStats = new ArrayList<>();
        String[] tables = {"branches", "customers", "users", "accounts", "bank_transactions", "loans"};

        for (String tbl : tables) {
            Map<String, Object> item = new HashMap<>();
            item.put("tableName", tbl);
            try {
                Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tbl, Long.class);
                item.put("rowCount", count);
            } catch (Exception e) {
                item.put("rowCount", 0);
            }

            // Columns metadata from information_schema
            String colsSql =
                    "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA " +
                    "FROM INFORMATION_SCHEMA.COLUMNS " +
                    "WHERE TABLE_SCHEMA = 'bank_of_bagru_db' AND TABLE_NAME = ? " +
                    "ORDER BY ORDINAL_POSITION";
            List<Map<String, Object>> cols = jdbcTemplate.queryForList(colsSql, tbl);
            item.put("columns", cols);

            tableStats.add(item);
        }

        result.put("databaseName", "bank_of_bagru_db");
        result.put("dbEngine", "MySQL 8.0 (InnoDB)");
        result.put("tables", tableStats);
        return result;
    }

    /**
     * Executes safe, predefined RDBMS demonstration queries with live result grids.
     */
    public Map<String, Object> executeDemonstrationQuery(String queryKey) {
        Map<String, Object> response = new HashMap<>();
        String sql;
        String title;
        String explanation;
        String rdbmsConcept;

        switch (queryKey) {
            case "JOIN_ACCOUNTS_CUSTOMERS_BRANCHES":
                title = "3-Way Multi-Table INNER JOIN";
                rdbmsConcept = "Relational JOINs & Foreign Key Navigation";
                explanation = "Demonstrates joining accounts with customers (customer_id) and branches (branch_id) to present a consolidated customer portfolio.";
                sql = "SELECT a.account_number, c.full_name AS customer_name, c.phone, " +
                      "       b.branch_name, b.ifsc_code, a.account_type, a.balance, a.account_status " +
                      "FROM accounts a " +
                      "INNER JOIN customers c ON a.customer_id = c.customer_id " +
                      "INNER JOIN branches b ON a.branch_id = b.branch_id " +
                      "ORDER BY a.balance DESC";
                break;

            case "AGGREGATE_GROUP_BY_HAVING":
                title = "Aggregate Functions with GROUP BY and HAVING";
                rdbmsConcept = "SUM, COUNT, GROUP BY, HAVING Clause";
                explanation = "Calculates total deposits and account count per branch, filtering branches with total deposits exceeding ₹1,00,000 using the HAVING clause.";
                sql = "SELECT b.branch_name, b.city, " +
                      "       COUNT(a.account_id) AS total_accounts, " +
                      "       SUM(a.balance) AS branch_total_balance, " +
                      "       ROUND(AVG(a.balance), 2) AS avg_account_balance " +
                      "FROM branches b " +
                      "INNER JOIN accounts a ON b.branch_id = a.branch_id " +
                      "WHERE a.account_status = 'Active' " +
                      "GROUP BY b.branch_id, b.branch_name, b.city " +
                      "HAVING branch_total_balance > 100000 " +
                      "ORDER BY branch_total_balance DESC";
                break;

            case "SUBQUERY_ABOVE_AVERAGE":
                title = "Correlated / Scalar Subquery Demonstration";
                rdbmsConcept = "Nested SQL Subqueries with Aggregate Comparison";
                explanation = "Finds all accounts whose balance is strictly above the bank-wide average balance across all active accounts.";
                sql = "SELECT a.account_number, c.full_name, a.account_type, a.balance, " +
                      "       (SELECT ROUND(AVG(balance), 2) FROM accounts WHERE account_status = 'Active') AS bank_avg_balance " +
                      "FROM accounts a " +
                      "INNER JOIN customers c ON a.customer_id = c.customer_id " +
                      "WHERE a.balance > (SELECT AVG(balance) FROM accounts WHERE account_status = 'Active') " +
                      "ORDER BY a.balance DESC";
                break;

            case "CUSTOMER_LOAN_ACCOUNT_SUMMARY":
                title = "LEFT OUTER JOIN for Relationship Cardinality";
                rdbmsConcept = "Preserving Non-Matching Rows (1:N Customer-to-Loan & Account Cardinality)";
                explanation = "Retrieves each customer along with their total account count and total active loan exposure, showing 0 for customers without loans.";
                sql = "SELECT c.customer_id, c.full_name, c.email, " +
                      "       COUNT(DISTINCT a.account_id) AS total_accounts, " +
                      "       COALESCE(SUM(DISTINCT a.balance), 0) AS total_savings_balance, " +
                      "       COUNT(DISTINCT l.loan_id) AS total_loans, " +
                      "       COALESCE(SUM(DISTINCT l.outstanding_amount), 0) AS total_debt_exposure " +
                      "FROM customers c " +
                      "LEFT JOIN accounts a ON c.customer_id = a.customer_id " +
                      "LEFT JOIN loans l ON c.customer_id = l.customer_id AND l.loan_status = 'Approved' " +
                      "GROUP BY c.customer_id, c.full_name, c.email " +
                      "ORDER BY total_accounts DESC";
                break;

            default:
                title = "Recent Transactions Audit Log";
                rdbmsConcept = "Transaction Ledger & Chronological Ordering";
                explanation = "Fetches the latest audited banking transactions with accounts and counterparty accounts.";
                sql = "SELECT t.transaction_reference, t.transaction_type, t.amount, " +
                      "       a.account_number AS primary_account, " +
                      "       rel.account_number AS counterparty_account, " +
                      "       t.description, t.transaction_date, t.transaction_status " +
                      "FROM bank_transactions t " +
                      "INNER JOIN accounts a ON t.account_id = a.account_id " +
                      "LEFT JOIN accounts rel ON t.related_account_id = rel.account_id " +
                      "ORDER BY t.transaction_date DESC " +
                      "LIMIT 15";
                break;
        }

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        response.put("title", title);
        response.put("concept", rdbmsConcept);
        response.put("sql", sql);
        response.put("explanation", explanation);
        response.put("rowCount", rows.size());
        response.put("results", rows);
        return response;
    }
}
