import React, { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Banknote,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { dashboardApi } from '../services/api';

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load live statistics from MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Querying live metrics from MySQL database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
        <div className="font-bold flex items-center mb-1">
          <AlertTriangle className="w-4 h-4 mr-1.5" /> Database Query Error
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const accountDist = stats?.accountDistribution || {};
  const totalAccs = stats?.totalAccounts || 1;
  const savingsPct = Math.round(((accountDist.Savings || 0) / totalAccs) * 100);
  const currentPct = Math.round(((accountDist.Current || 0) / totalAccs) * 100);
  const fdPct = Math.round(((accountDist['Fixed Deposit'] || 0) / totalAccs) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-500">Real-time financial positions aggregated from MySQL relational tables</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 core metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          subtitle="KYC Verified Customers"
          icon={Users}
          color="blue"
          trend="Live Active"
        />
        <StatCard
          title="Bank Accounts"
          value={stats?.totalAccounts || 0}
          subtitle="Savings, Current, FD"
          icon={Wallet}
          color="indigo"
          trend={`${stats?.totalAccounts || 0} Accounts`}
        />
        <StatCard
          title="Total Bank Balance"
          value={formatCurrency(stats?.totalBankBalance)}
          subtitle="Liquidity Across Accounts"
          icon={Coins}
          color="emerald"
          trend="In Vault"
        />
        <StatCard
          title="Active Loan Exposure"
          value={formatCurrency(stats?.totalOutstandingLoanAmount)}
          subtitle={`${stats?.totalActiveLoans || 0} Approved Loans Active`}
          icon={Banknote}
          color="purple"
          trend="Asset Portfolio"
        />
      </div>

      {/* Secondary Flow Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Cumulative Deposits</div>
              <div className="text-base font-bold text-slate-900">{formatCurrency(stats?.totalDeposits)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Withdrawals</div>
              <div className="text-base font-bold text-slate-900">{formatCurrency(stats?.totalWithdrawals)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Transfers Volume</div>
              <div className="text-base font-bold text-slate-900">{formatCurrency(stats?.totalTransfers)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Distribution & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Type Distribution Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Distribution</h3>
            <span className="text-[11px] text-slate-500 font-medium">By Product Type</span>
          </div>

          <div className="space-y-4">
            {/* Savings bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Savings Accounts</span>
                <span className="text-slate-500">{accountDist.Savings || 0} ({savingsPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${savingsPct}%` }} />
              </div>
            </div>

            {/* Current bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Current / Business</span>
                <span className="text-slate-500">{accountDist.Current || 0} ({currentPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentPct}%` }} />
              </div>
            </div>

            {/* Fixed Deposit bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Fixed Deposits (FD)</span>
                <span className="text-slate-500">{accountDist['Fixed Deposit'] || 0} ({fdPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fdPct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-around text-center text-xs">
            <div>
              <div className="font-bold text-slate-900">{accountDist.Savings || 0}</div>
              <div className="text-[10px] text-slate-500">Savings</div>
            </div>
            <div className="border-r border-slate-200 h-6"></div>
            <div>
              <div className="font-bold text-slate-900">{accountDist.Current || 0}</div>
              <div className="text-[10px] text-slate-500">Current</div>
            </div>
            <div className="border-r border-slate-200 h-6"></div>
            <div>
              <div className="font-bold text-slate-900">{accountDist['Fixed Deposit'] || 0}</div>
              <div className="text-[10px] text-slate-500">Term Deposit</div>
            </div>
          </div>
        </div>

        {/* Monthly Activity / SQL Grouping Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transaction Activity History</h3>
              <p className="text-[11px] text-slate-500">Aggregated via SQL GROUP BY transaction_type & month</p>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm mr-1"></span> Deposits</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm mr-1"></span> Withdrawals</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm mr-1"></span> Transfers</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2">Month Period</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-right">Volume</th>
                  <th className="py-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.monthlyTransactionSummary?.length ? (
                  stats.monthlyTransactionSummary.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 font-medium text-slate-800">{row.month_label}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.transaction_type === 'Deposit' ? 'bg-emerald-50 text-emerald-700' :
                          row.transaction_type === 'Withdrawal' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {row.transaction_type}
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-600 font-mono">{row.txn_count} txns</td>
                      <td className="py-2 text-right font-bold text-slate-900 font-mono">{formatCurrency(row.total_amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">No monthly transaction data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Bank Transactions</h3>
            <p className="text-xs text-slate-500">Live ledger activity from bank_transactions table</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All Ledger Entries →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentTransactions?.length ? (
                stats.recentTransactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{tx.reference}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.accountNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{tx.customerName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.transactionType === 'Deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        tx.transactionType === 'Withdrawal' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
