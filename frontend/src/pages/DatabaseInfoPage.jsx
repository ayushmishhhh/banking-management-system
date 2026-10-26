import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Key,
  GitCommit,
  Layers,
  Code2,
  Play,
  RefreshCw,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Server
} from 'lucide-react';
import { databaseInfoApi } from '../services/api';

export default function DatabaseInfoPage({ showToast }) {
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram', 'schema', 'normalization', 'queries'
  const [schemaData, setSchemaData] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Demo Query Runner states
  const [selectedQueryKey, setSelectedQueryKey] = useState('JOIN_ACCOUNTS_CUSTOMERS_BRANCHES');
  const [queryResult, setQueryResult] = useState(null);
  const [executingQuery, setExecutingQuery] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        const res = await databaseInfoApi.getSchema();
        setSchemaData(res?.data);
      } catch (err) {
        showToast('Error loading schema: ' + err.message, 'error');
      } finally {
        setLoadingSchema(false);
      }
    };
    fetchSchema();
    handleRunDemoQuery('JOIN_ACCOUNTS_CUSTOMERS_BRANCHES');
  }, []);

  const handleRunDemoQuery = async (key) => {
    setSelectedQueryKey(key);
    try {
      setExecutingQuery(true);
      const res = await databaseInfoApi.executeDemoQuery(key);
      setQueryResult(res?.data);
    } catch (err) {
      showToast('Error executing SQL query: ' + err.message, 'error');
    } finally {
      setExecutingQuery(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Relational Database Management System (RDBMS) Showcase</h2>
        <p className="text-xs text-slate-500">Academic database design, 3NF normalization proofs, live INFORMATION_SCHEMA metadata, and query catalog</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'diagram'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Entity-Relationship (ER) Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Live Schema & Data Dictionary</span>
        </button>

        <button
          onClick={() => setActiveTab('normalization')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'normalization'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Normalization Analysis (1NF–3NF)</span>
        </button>

        <button
          onClick={() => setActiveTab('queries')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'queries'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Interactive SQL Query Catalog</span>
        </button>
      </div>

      {/* TAB 1: ER DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-6 animate-fade-in">
          {/* Visual Architecture Cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Entity Relationship Diagram (Crow's Foot Notation)</h3>
                <p className="text-xs text-slate-500">Database: bank_of_bagru_db • Primary & Foreign Key Mappings</p>
              </div>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
                MySQL 8.0 InnoDB
              </span>
            </div>

            {/* Visual Vector ER Diagram */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 shadow-xs">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Full Relational Vector ER Diagram (PK, FK, UK, CK & Cardinalities)
                </span>
                <a
                  href="/er-diagram.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Open High-Res SVG ↗
                </a>
              </div>
              <img
                src="/er-diagram.svg"
                alt="Entity-Relationship (ER) Diagram"
                className="w-full h-auto rounded-lg bg-white border border-slate-200"
              />
            </div>

            {/* Visual ER ASCII / Flow Model */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
              <pre>{`
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
  | FK account_id           (Debited / Credited Account)    |
  | FK related_account_id   (Counterparty Account)          |
  |    transaction_type     (Deposit, Withdrawal, Transfer) |
  |    amount               (DECIMAL(15,2) > 0)             |
  |    transaction_date     (Audit Timestamp)               |
  |    description          (Narrative)                     |
  |    transaction_status   (Success, Failed)               |
  +---------------------------------------------------------+
              `}</pre>
            </div>

            {/* Relationship Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                  <Key className="w-4 h-4 mr-1.5 text-blue-600" />
                  Cardinalities & Referential Constraints
                </h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li><strong>Customers to Accounts (1:N):</strong> One customer may own multiple savings, current, and term accounts.</li>
                  <li><strong>Branches to Accounts (1:N):</strong> Each branch maintains hundreds of local accounts.</li>
                  <li><strong>Customers to Loans (1:N):</strong> A customer can apply for multiple credit lines (Home, Personal, etc.).</li>
                  <li><strong>Accounts to Transactions (1:N):</strong> Every balance mutation produces an immutable ledger entry.</li>
                  <li><strong>Transfer Counterparty (Self-Referential FK):</strong> <code>related_account_id</code> links sending and receiving accounts.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Integrity Guardrails & Rules
                </h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li><strong>ON DELETE RESTRICT:</strong> Customers with active accounts cannot be purged.</li>
                  <li><strong>CHECK (`balance` &gt;= 0):</strong> Database engine level check preventing negative balances.</li>
                  <li><strong>CHECK (`amount` &gt; 0):</strong> Monetary values must be strictly positive.</li>
                  <li><strong>Exact Precision:</strong> <code>DECIMAL(15,2)</code> is utilized rather than binary floating-point.</li>
                  <li><strong>ACID Guarantees:</strong> Transactions wrapped under Spring <code>@Transactional(isolation = READ_COMMITTED)</code>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA EXPLORER */}
      {activeTab === 'schema' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Data Dictionary (Queried from MySQL INFORMATION_SCHEMA)</h3>
                <p className="text-xs text-slate-500">Inspect table structures, column definitions, data types, keys, and live record counts</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">bank_of_bagru_db</span>
            </div>

            {loadingSchema ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Querying INFORMATION_SCHEMA...
              </div>
            ) : (
              <div className="space-y-6">
                {schemaData?.tables?.map((table) => (
                  <div key={table.tableName} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Table className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-bold text-slate-900 text-xs">{table.tableName}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {table.rowCount} live rows
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Column Name</th>
                            <th className="py-2 px-3">Data Type</th>
                            <th className="py-2 px-3">Nullable</th>
                            <th className="py-2 px-3">Key Type</th>
                            <th className="py-2 px-3">Default</th>
                            <th className="py-2 px-3">Attributes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {table.columns?.map((col) => (
                            <tr key={col.COLUMN_NAME} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-bold text-slate-800">{col.COLUMN_NAME}</td>
                              <td className="py-2 px-3 text-blue-700">{col.COLUMN_TYPE}</td>
                              <td className="py-2 px-3 text-slate-600">{col.IS_NULLABLE}</td>
                              <td className="py-2 px-3">
                                {col.COLUMN_KEY === 'PRI' ? (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-200">
                                    PRIMARY KEY
                                  </span>
                                ) : col.COLUMN_KEY === 'UNI' ? (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200">
                                    UNIQUE
                                  </span>
                                ) : col.COLUMN_KEY === 'MUL' ? (
                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-200">
                                    INDEX / FK
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="py-2 px-3 text-slate-500">{col.COLUMN_DEFAULT || 'NULL'}</td>
                              <td className="py-2 px-3 text-slate-500">{col.EXTRA || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NORMALIZATION PROOFS */}
      {activeTab === 'normalization' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Database Normalization Report (1NF to 3NF)</h3>
              <p className="text-xs text-slate-500">Formal mathematical proof demonstrating elimination of anomalies and data redundancy</p>
            </div>

            {/* 1NF Card */}
            <div className="p-5 border border-blue-100 rounded-xl bg-blue-50/30 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900">First Normal Form (1NF) Compliance</h4>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Rule:</strong> Each column contains atomic (indivisible) values, each record is unique, and no repeating groups exist.
              </p>
              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <strong>Implementation Proof:</strong> In <code>customers</code>, customer contact fields (email, phone, address) are separated into individual atomic attributes. In <code>accounts</code>, transactions are not stored in nested lists or comma-separated columns; instead, every transaction exists as its own atomic record in the separate <code>bank_transactions</code> table.
              </div>
            </div>

            {/* 2NF Card */}
            <div className="p-5 border border-emerald-100 rounded-xl bg-emerald-50/30 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-slate-900">Second Normal Form (2NF) Compliance</h4>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Rule:</strong> The relation is in 1NF and contains <em>no partial dependencies</em>. All non-prime attributes must be fully functionally dependent on the entire primary key.
              </p>
              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <strong>Implementation Proof:</strong> Every table utilizes an atomic surrogate primary key (e.g. <code>customer_id</code>, <code>account_id</code>, <code>branch_id</code>, <code>transaction_id</code>). Because there are no composite primary keys, partial dependency is mathematically impossible: all non-key attributes depend entirely on the single-attribute primary key.
              </div>
            </div>

            {/* 3NF Card */}
            <div className="p-5 border border-purple-100 rounded-xl bg-purple-50/30 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="text-sm font-bold text-slate-900">Third Normal Form (3NF) Compliance</h4>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Rule:</strong> The relation is in 2NF and contains <em>no transitive dependencies</em> (no non-key attribute is dependent on another non-key attribute: X &rarr; Y and Y &rarr; Z).
              </p>
              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <strong>Implementation Proof:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Branch De-duplication:</strong> Rather than storing branch name, address, and city inside the <code>accounts</code> table, we decomposed branches into the <code>branches</code> entity and stored only <code>branch_id</code>.</li>
                  <li><strong>Customer De-duplication:</strong> Account and loan records do not repeat customer email, phone, or DOB; they reference <code>customer_id</code>.</li>
                  <li><strong>Elimination of Insertion, Update, and Deletion Anomalies:</strong> Modifying a branch's IFSC code requires updating exactly one row in <code>branches</code>, eliminating inconsistent duplicates.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE SQL QUERY RUNNER */}
      {activeTab === 'queries' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live SQL Query Demonstration Engine</h3>
              <p className="text-xs text-slate-500">Run real RDBMS queries demonstrating multi-table JOINs, subqueries, and aggregate functions directly in MySQL</p>
            </div>

            {/* Query Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => handleRunDemoQuery('JOIN_ACCOUNTS_CUSTOMERS_BRANCHES')}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                  selectedQueryKey === 'JOIN_ACCOUNTS_CUSTOMERS_BRANCHES'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">1. 3-Way INNER JOIN</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Accounts + Customers + Branches</div>
              </button>

              <button
                onClick={() => handleRunDemoQuery('AGGREGATE_GROUP_BY_HAVING')}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                  selectedQueryKey === 'AGGREGATE_GROUP_BY_HAVING'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">2. GROUP BY & HAVING</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Branch Sums &gt; ₹1,00,000</div>
              </button>

              <button
                onClick={() => handleRunDemoQuery('SUBQUERY_ABOVE_AVERAGE')}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                  selectedQueryKey === 'SUBQUERY_ABOVE_AVERAGE'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">3. Correlated Subquery</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Accounts &gt; Bank Avg Balance</div>
              </button>

              <button
                onClick={() => handleRunDemoQuery('CUSTOMER_LOAN_ACCOUNT_SUMMARY')}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                  selectedQueryKey === 'CUSTOMER_LOAN_ACCOUNT_SUMMARY'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">4. LEFT OUTER JOIN</div>
                <div className="text-[11px] text-slate-500 mt-0.5">1:N Cardinality Aggregation</div>
              </button>
            </div>

            {/* SQL Terminal Box */}
            {queryResult && (
              <div className="space-y-4">
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs shadow-md">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
                    <span className="text-emerald-400 font-bold">SQL Execution Console</span>
                    <span className="text-slate-400">Concept: {queryResult.concept}</span>
                  </div>
                  <pre className="text-blue-300 whitespace-pre-wrap">{queryResult.sql}</pre>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <span className="font-bold">RDBMS Explanation:</span> {queryResult.explanation}
                </div>

                {/* Live Results Grid */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{queryResult.title} Results</span>
                    <span className="font-mono text-slate-500">{queryResult.rowCount} rows returned</span>
                  </div>

                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] uppercase sticky top-0">
                        <tr>
                          {queryResult.results?.length > 0 &&
                            Object.keys(queryResult.results[0]).map((col) => (
                              <th key={col} className="py-2 px-3">{col}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryResult.results?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 text-slate-800 whitespace-nowrap">
                                {val !== null && val !== undefined ? val.toString() : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
