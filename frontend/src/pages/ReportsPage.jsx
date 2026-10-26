import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  Download,
  Search,
  RefreshCw,
  Landmark,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { reportsApi, accountsApi } from '../services/api';

export default function ReportsPage({ showToast }) {
  const [activeReport, setActiveReport] = useState('statement'); // 'statement', 'branches', 'highvalue', 'loans'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Statement Generator states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [statementStart, setStatementStart] = useState('');
  const [statementEnd, setStatementEnd] = useState('');
  const [statementData, setStatementData] = useState(null);

  // Other reports
  const [branchReports, setBranchReports] = useState([]);
  const [highValueTxns, setHighValueTxns] = useState([]);
  const [threshold, setThreshold] = useState('50000.00');
  const [loanPortfolio, setLoanPortfolio] = useState([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await accountsApi.getAll();
        setAccounts(res?.data || []);
        if (res?.data?.length) {
          setSelectedAccountId(res.data[0].accountId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadAccounts();
  }, []);

  const handleGenerateStatement = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAccountId) {
      showToast('Please select an account.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await reportsApi.getStatement(selectedAccountId, statementStart, statementEnd);
      setStatementData(res?.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBranchPerformance = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getBranchPerformance();
      setBranchReports(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHighValueTxns = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getHighValueTransactions(parseFloat(threshold) || 50000);
      setHighValueTxns(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLoanPortfolio = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getLoanPortfolio();
      setLoanPortfolio(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeReport === 'branches') loadBranchPerformance();
    if (activeReport === 'highvalue') loadHighValueTxns();
    if (activeReport === 'loans') loadLoanPortfolio();
  }, [activeReport]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Banking Analytics & Regulatory Reports</h2>
        <p className="text-xs text-slate-500">Formal statement generation, cross-table branch metrics, and audit queries</p>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          onClick={() => setActiveReport('statement')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeReport === 'statement'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Account Statement
        </button>

        <button
          onClick={() => setActiveReport('branches')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeReport === 'branches'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Branch Performance Summary
        </button>

        <button
          onClick={() => setActiveReport('highvalue')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeReport === 'highvalue'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          High-Value Transactions (&gt; ₹50,000)
        </button>

        <button
          onClick={() => setActiveReport('loans')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeReport === 'loans'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Loan Portfolio Overview
        </button>
      </div>

      {/* REPORT 1: ACCOUNT STATEMENT GENERATOR */}
      {activeReport === 'statement' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <form onSubmit={handleGenerateStatement} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Select Bank Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-800"
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.accountId} value={a.accountId}>
                      {a.accountNumber} — {a.customerName} ({a.accountType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">From Date (Optional)</label>
                <input
                  type="date"
                  value={statementStart}
                  onChange={(e) => setStatementStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">To Date (Optional)</label>
                <input
                  type="date"
                  value={statementEnd}
                  onChange={(e) => setStatementEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Generating Statement...' : 'Generate Official Statement'}
                </button>
              </div>
            </form>
          </div>

          {/* Statement View */}
          {statementData && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 max-w-4xl mx-auto space-y-6">
              {/* Bank Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <Landmark className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Bank of Bagru</h2>
                    <p className="text-xs text-slate-500">Scheduled Commercial Bank • Reg. Office: Bagru, Jaipur</p>
                    <p className="text-[11px] text-blue-700 font-mono font-bold mt-0.5">
                      Branch: {statementData.branchName} (IFSC: {statementData.ifscCode})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Statement Period</span>
                  <div className="text-xs font-bold text-slate-800">
                    {statementData.startDate} to {statementData.endDate}
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                </div>
              </div>

              {/* Account & Customer Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Holder</span>
                  <span className="font-bold text-slate-900">{statementData.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Number</span>
                  <span className="font-bold font-mono text-slate-900">{statementData.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Type</span>
                  <span className="font-semibold text-slate-800">{statementData.accountType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Closing Balance</span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">{formatCurrency(statementData.closingBalance)}</span>
                </div>
              </div>

              {/* Financial Movement Summary */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Opening Balance</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{formatCurrency(statementData.openingBalance)}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-emerald-700 text-[10px] uppercase font-semibold">Total Deposits (Credits)</span>
                  <div className="font-mono font-bold text-emerald-800 mt-0.5">+{formatCurrency(statementData.totalCredits)}</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-rose-700 text-[10px] uppercase font-semibold">Total Withdrawals (Debits)</span>
                  <div className="font-mono font-bold text-rose-800 mt-0.5">-{formatCurrency(statementData.totalDebits)}</div>
                </div>
              </div>

              {/* Statement Line Entries */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Txn Reference</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Debit (Withdrawal)</th>
                      <th className="py-2.5 px-3 text-right">Credit (Deposit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statementData.statementLines?.length ? (
                      statementData.statementLines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {new Date(line.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{line.reference}</td>
                          <td className="py-2.5 px-3 text-slate-700">{line.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400">
                          No transactions found in selected date interval.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Notice */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Computer-generated official statement • No signature required</span>
                <span className="font-mono">Bank of Bagru Core System</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT 2: BRANCH PERFORMANCE */}
      {activeReport === 'branches' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Performance & Resource Aggregation</h3>
              <p className="text-xs text-slate-500">SQL multi-table LEFT JOIN across branches, accounts, and loans</p>
            </div>
            <button
              onClick={loadBranchPerformance}
              className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Branch ID</th>
                  <th className="py-3 px-3">Branch Office</th>
                  <th className="py-3 px-3">IFSC</th>
                  <th className="py-3 px-3 text-right">Active Accounts</th>
                  <th className="py-3 px-3 text-right">Total Deposits Balance</th>
                  <th className="py-3 px-3 text-right">Total Active Loans</th>
                  <th className="py-3 px-3 text-right">Outstanding Loan Exposure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchReports.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">#{b.branch_id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.branch_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{b.ifsc_code}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{b.total_accounts}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrency(b.total_deposits_balance)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{b.total_loans}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                      {formatCurrency(b.total_loan_outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: HIGH VALUE TRANSACTIONS */}
      {activeReport === 'highvalue' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">High-Value Transaction Monitoring (AML/Compliance)</h3>
              <p className="text-xs text-slate-500">Flags transactions meeting or exceeding threshold limit</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-slate-600">Threshold (₹):</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-28 px-2 py-1 border border-slate-300 rounded font-mono"
              />
              <button
                onClick={loadHighValueTxns}
                className="px-3 py-1 bg-slate-900 text-white rounded font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3">Holder</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highValueTxns.map((t) => (
                  <tr key={t.transactionId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{t.transactionReference}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{t.account?.accountNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{t.account?.customer?.fullName}</td>
                    <td className="py-3 px-3 font-semibold text-blue-600">{t.transactionType}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(t.transactionDate).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {t.transactionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: LOAN PORTFOLIO */}
      {activeReport === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Loan Portfolio Distribution & Risk Profile</h3>
            <p className="text-xs text-slate-500">Aggregated via SQL GROUP BY loan_type and loan_status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Loan Category</th>
                  <th className="py-3 px-3">Underwriting Status</th>
                  <th className="py-3 px-3 text-right">Total Facilities</th>
                  <th className="py-3 px-3 text-right">Sanctioned Principal</th>
                  <th className="py-3 px-3 text-right">Current Outstanding</th>
                  <th className="py-3 px-3 text-right">Avg Interest Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loanPortfolio.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-900">{row.loan_type}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.loan_status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        row.loan_status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.loan_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{row.count}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">{formatCurrency(row.total_principal)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">{formatCurrency(row.total_outstanding)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">{row.avg_interest_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
