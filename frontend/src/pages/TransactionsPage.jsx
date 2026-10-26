import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Calendar,
  Filter,
  Receipt,
  Download,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import { transactionsApi, accountsApi } from '../services/api';
import Modal from '../components/Modal';

export default function TransactionsPage({ showToast }) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'withdraw', 'transfer', 'history'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [depositForm, setDepositForm] = useState({ accountId: '', amount: '', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({ accountId: '', amount: '', description: '' });
  const [transferForm, setTransferForm] = useState({ sourceAccountId: '', destinationAccountId: '', amount: '', description: '' });

  // Receipt Modal
  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Ledger / History
  const [transactions, setTransactions] = useState([]);
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await accountsApi.getAll();
      setAccounts(res?.data || []);
      if (res?.data?.length) {
        const firstActive = res.data.find(a => a.accountStatus === 'Active') || res.data[0];
        setDepositForm(prev => ({ ...prev, accountId: prev.accountId || firstActive.accountId }));
        setWithdrawForm(prev => ({ ...prev, accountId: prev.accountId || firstActive.accountId }));
        setTransferForm(prev => ({
          ...prev,
          sourceAccountId: prev.sourceAccountId || firstActive.accountId,
          destinationAccountId: prev.destinationAccountId || (res.data[1]?.accountId || '')
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionsApi.getAll({
        accountId: filterAccount || null,
        type: filterType === 'ALL' ? '' : filterType,
        status: filterStatus === 'ALL' ? '' : filterStatus,
        startDate: filterStartDate || null,
        endDate: filterEndDate || null,
      });
      setTransactions(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositForm.accountId || !depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      showToast('Please enter a valid positive deposit amount.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await transactionsApi.deposit({
        accountId: parseInt(depositForm.accountId),
        amount: parseFloat(depositForm.amount),
        description: depositForm.description
      });
      showToast('Deposit processed successfully!', 'success');
      const acc = accounts.find(a => a.accountId === parseInt(depositForm.accountId));
      setReceiptData({
        reference: res?.data?.transactionReference,
        transactionType: 'Deposit',
        amount: depositForm.amount,
        accountNumber: acc?.accountNumber,
        customerName: acc?.customerName,
        date: new Date().toISOString(),
        description: depositForm.description || 'Cash Deposit',
        status: 'Success'
      });
      setIsReceiptOpen(true);
      setDepositForm(prev => ({ ...prev, amount: '', description: '' }));
      fetchAccounts();
      fetchTransactions();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawForm.accountId || !withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      showToast('Please enter a valid positive withdrawal amount.', 'error');
      return;
    }

    const selectedAcc = accounts.find(a => a.accountId === parseInt(withdrawForm.accountId));
    if (selectedAcc && parseFloat(withdrawForm.amount) > parseFloat(selectedAcc.balance)) {
      showToast(`Insufficient funds: Available balance is ₹${selectedAcc.balance}`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await transactionsApi.withdraw({
        accountId: parseInt(withdrawForm.accountId),
        amount: parseFloat(withdrawForm.amount),
        description: withdrawForm.description
      });
      showToast('Withdrawal completed successfully!', 'success');
      setReceiptData({
        reference: res?.data?.transactionReference,
        transactionType: 'Withdrawal',
        amount: withdrawForm.amount,
        accountNumber: selectedAcc?.accountNumber,
        customerName: selectedAcc?.customerName,
        date: new Date().toISOString(),
        description: withdrawForm.description || 'Cash Withdrawal',
        status: 'Success'
      });
      setIsReceiptOpen(true);
      setWithdrawForm(prev => ({ ...prev, amount: '', description: '' }));
      fetchAccounts();
      fetchTransactions();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (transferForm.sourceAccountId === transferForm.destinationAccountId) {
      showToast('Source and destination accounts cannot be identical.', 'error');
      return;
    }
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      showToast('Please enter a valid positive transfer amount.', 'error');
      return;
    }

    const srcAcc = accounts.find(a => a.accountId === parseInt(transferForm.sourceAccountId));
    if (srcAcc && parseFloat(transferForm.amount) > parseFloat(srcAcc.balance)) {
      showToast(`Transfer declined: Source account balance is ₹${srcAcc.balance}`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await transactionsApi.transfer({
        sourceAccountId: parseInt(transferForm.sourceAccountId),
        destinationAccountId: parseInt(transferForm.destinationAccountId),
        amount: parseFloat(transferForm.amount),
        description: transferForm.description
      });
      showToast('Fund transfer completed with ACID transactional safety!', 'success');
      setReceiptData(res?.data);
      setIsReceiptOpen(true);
      setTransferForm(prev => ({ ...prev, amount: '', description: '' }));
      fetchAccounts();
      fetchTransactions();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const getAccountLabel = (acc) => {
    return `${acc.accountNumber} • ${acc.customerName} (${acc.accountType} - Bal: ${formatCurrency(acc.balance)})`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Banking Transactions & Fund Transfers</h2>
        <p className="text-xs text-slate-500">Atomic @Transactional operations with pessimistic locking and ACID consistency</p>
      </div>

      {/* Operation Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'deposit'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Deposit Cash</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'withdraw'
              ? 'border-rose-600 text-rose-600 bg-rose-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Withdraw Cash</span>
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'transfer'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Inter-Account Transfer</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Transaction History & Audit</span>
        </button>
      </div>

      {/* Tab 1: DEPOSIT */}
      {activeTab === 'deposit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl animate-fade-in">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Credit Account Deposit</h3>
              <p className="text-xs text-slate-500">Increases account balance and creates an immutable credit ledger entry</p>
            </div>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Beneficiary Account *</label>
              <select
                value={depositForm.accountId}
                onChange={(e) => setDepositForm({ ...depositForm, accountId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                {accounts.filter(a => a.accountStatus === 'Active').map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {getAccountLabel(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 5000.00"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Description / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Counter Cash Deposit / Salary Credit"
                value={depositForm.description}
                onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{submitting ? 'Executing Deposit...' : 'Confirm & Process Deposit'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: WITHDRAWAL */}
      {activeTab === 'withdraw' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl animate-fade-in">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Debit Account Withdrawal</h3>
              <p className="text-xs text-slate-500">Decreases account balance with strict negative balance protection</p>
            </div>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Source Account *</label>
              <select
                value={withdrawForm.accountId}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, accountId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                required
              >
                {accounts.filter(a => a.accountStatus === 'Active').map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {getAccountLabel(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Withdrawal Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 2000.00"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Description / Purpose</label>
              <input
                type="text"
                placeholder="e.g. ATM Cash Withdrawal / Counter Cheque"
                value={withdrawForm.description}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>{submitting ? 'Verifying Funds & Withdrawing...' : 'Confirm & Process Withdrawal'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: FUND TRANSFER */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl animate-fade-in">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Inter-Account Fund Transfer</h3>
              <p className="text-xs text-slate-500">Atomic two-phase debit & credit with shared audit transaction reference</p>
            </div>
          </div>

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Account (Debit) *</label>
              <select
                value={transferForm.sourceAccountId}
                onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {accounts.filter(a => a.accountStatus === 'Active').map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {getAccountLabel(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Account (Credit) *</label>
              <select
                value={transferForm.destinationAccountId}
                onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {accounts.filter(a => a.accountStatus === 'Active').map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {getAccountLabel(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 10000.00"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Remarks / Description</label>
              <input
                type="text"
                placeholder="e.g. Invoice payment / Vendor settlement"
                value={transferForm.description}
                onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transaction Atomicity Guarantee:</span> Both debit and credit operations are wrapped inside Spring's <code>@Transactional</code>. If either account fails or funds are insufficient, the entire transfer rolls back completely.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{submitting ? 'Executing Atomic Transfer...' : 'Execute Fund Transfer'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: TRANSACTION HISTORY & AUDIT LEDGER */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Filter Account</label>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.accountId} value={a.accountId}>{a.accountNumber} ({a.customerName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Transaction Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  onClick={fetchTransactions}
                  className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterAccount('');
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setTimeout(fetchTransactions, 50);
                  }}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Audit Reference</th>
                    <th className="py-3 px-4">Account Number</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Fetching transactions from MySQL bank_transactions table...
                      </td>
                    </tr>
                  ) : transactions.length ? (
                    transactions.map((t) => (
                      <tr key={t.transactionId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">#{t.transactionId}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{t.transactionReference}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{t.account?.accountNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.transactionType === 'Deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.transactionType === 'Withdrawal' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {t.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{t.description}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(t.transactionDate).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                            {t.transactionStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No transactions found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Transaction Receipt"
        subtitle="Bank of Bagru — System Generated Transaction Voucher"
        maxWidth="max-w-md"
      >
        {receiptData && (
          <div className="space-y-4">
            {/* Receipt Header */}
            <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">Transaction Successful</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{formatCurrency(receiptData.amount)}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Ref: {receiptData.reference}</div>
            </div>

            {/* Receipt Details Grid */}
            <div className="border border-slate-200 rounded-xl p-4 divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Operation Type</span>
                <span className="font-bold text-slate-800">{receiptData.transactionType}</span>
              </div>
              {receiptData.accountNumber && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.accountNumber}</span>
                </div>
              )}
              {receiptData.customerName && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Account Holder</span>
                  <span className="font-semibold text-slate-800">{receiptData.customerName}</span>
                </div>
              )}
              {receiptData.sourceAccountNumber && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Debited Account</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.sourceAccountNumber}</span>
                </div>
              )}
              {receiptData.destinationAccountNumber && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Beneficiary Account</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.destinationAccountNumber}</span>
                </div>
              )}
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600">SUCCESS</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-700">{new Date().toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Print / Close Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
