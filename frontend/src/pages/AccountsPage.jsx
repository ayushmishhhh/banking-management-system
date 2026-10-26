import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Search,
  PlusCircle,
  Eye,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Building2,
  Lock,
  Unlock,
  XCircle,
  Filter,
  History,
  ArrowRight
} from 'lucide-react';
import { accountsApi, branchesApi, customersApi, transactionsApi } from '../services/api';
import Modal from '../components/Modal';

export default function AccountsPage({ showToast, onNavigateToTxn }) {
  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Active items
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountTxns, setAccountTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Form
  const [formData, setFormData] = useState({
    customerId: '',
    branchId: '',
    accountType: 'Savings',
    balance: '5000.00',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountsApi.getAll({
        search,
        type: selectedType === 'ALL' ? '' : selectedType,
        branchId: selectedBranch === 'ALL' ? '' : selectedBranch,
        status: selectedStatus === 'ALL' ? '' : selectedStatus,
      });
      if (res?.data) {
        setAccounts(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        branchesApi.getAll(),
        customersApi.getAll()
      ]);
      setBranches(bRes?.data || []);
      setCustomers(cRes?.data || []);
      if (bRes?.data?.length && !formData.branchId) {
        setFormData(prev => ({ ...prev, branchId: bRes.data[0].branchId }));
      }
      if (cRes?.data?.length && !formData.customerId) {
        setFormData(prev => ({ ...prev, customerId: cRes.data[0].customerId }));
      }
    } catch (err) {
      console.error('Error fetching branches or customers lookup', err);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [selectedType, selectedBranch, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAccounts();
  };

  const handleViewAccount = async (acc) => {
    setSelectedAccount(acc);
    setIsViewModalOpen(true);
    setLoadingTxns(true);
    try {
      const res = await transactionsApi.getByAccount(acc.accountId);
      setAccountTxns(res?.data || []);
    } catch (err) {
      showToast('Error loading transaction history: ' + err.message, 'error');
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.branchId || !formData.accountType) {
      showToast('Please fill all required account fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await accountsApi.create({
        customerId: parseInt(formData.customerId),
        branchId: parseInt(formData.branchId),
        accountType: formData.accountType,
        balance: parseFloat(formData.balance) || 0,
      });
      showToast(`Account ${res?.data?.accountNumber} opened successfully!`, 'success');
      setIsCreateModalOpen(false);
      fetchAccounts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAccount || !newStatus) return;
    try {
      setSubmitting(true);
      await accountsApi.updateStatus(selectedAccount.accountId, newStatus);
      showToast(`Account status updated to ${newStatus}.`, 'success');
      setIsStatusModalOpen(false);
      fetchAccounts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Management</h2>
          <p className="text-xs text-slate-500">Manage savings, current, and term deposit accounts with ledger integration</p>
        </div>

        <button
          onClick={() => {
            fetchLookups();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Open New Bank Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Account Number or Customer Name..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Filters:
          </span>

          {/* Account Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Account Types</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Fixed Deposit">Fixed Deposit</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Frozen">Frozen</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            type="button"
            onClick={fetchAccounts}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors ml-auto cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Accounts Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Branch & IFSC</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Querying accounts from MySQL...
                  </td>
                </tr>
              ) : accounts.length ? (
                accounts.map((acc) => (
                  <tr key={acc.accountId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {acc.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{acc.branchName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{acc.ifscCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        acc.accountType === 'Savings' ? 'bg-blue-50 text-blue-700' :
                        acc.accountType === 'Current' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 text-sm">
                      {formatCurrency(acc.balance)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        acc.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        acc.accountStatus === 'Frozen' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          acc.accountStatus === 'Active' ? 'bg-emerald-500' :
                          acc.accountStatus === 'Frozen' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {acc.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewAccount(acc)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="View Account Details & Ledger"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setNewStatus(acc.accountStatus === 'Active' ? 'Frozen' : 'Active');
                          setIsStatusModalOpen(true);
                        }}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          acc.accountStatus === 'Active'
                            ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Change Account Status (Freeze / Unfreeze / Close)"
                      >
                        {acc.accountStatus === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No accounts found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Open New Bank Account */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open New Bank Account"
        subtitle="Generates unique account number in MySQL accounts table"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose Verified Customer --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  #{c.customerId} — {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Branch *</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose Bank Branch --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName} ({b.ifscCode} • {b.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Product Type *</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Savings">Savings Account</option>
                <option value="Current">Current / Business Account</option>
                <option value="Fixed Deposit">Fixed Deposit (FD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Deposit (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <span className="font-bold">System Automation:</span> A unique 11-digit account number with prefix <strong>BOB</strong> will be generated automatically and assigned.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Opening Account...' : 'Open Account Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: View Account Details & Transaction History */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Account Details & Audit Ledger"
        subtitle={`Account: ${selectedAccount?.accountNumber} • Holder: ${selectedAccount?.customerName}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">{selectedAccount?.accountType} Account</div>
              <div className="text-xl font-mono font-bold tracking-tight text-white">{selectedAccount?.accountNumber}</div>
              <div className="text-xs text-slate-300 mt-0.5">{selectedAccount?.branchName} • IFSC: {selectedAccount?.ifscCode}</div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Balance</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{formatCurrency(selectedAccount?.balance)}</div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                selectedAccount?.accountStatus === 'Active' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60' : 'bg-amber-900/60 text-amber-300'
              }`}>
                {selectedAccount?.accountStatus}
              </span>
            </div>
          </div>

          {/* Account Ledger Entries */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <History className="w-4 h-4 mr-1 text-blue-600" />
                Recent Account Ledger Entries
              </h4>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  if (onNavigateToTxn) onNavigateToTxn();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
              >
                Go to Transactions <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            {loadingTxns ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading ledger records...</div>
            ) : accountTxns.length ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Reference</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountTxns.map((t) => (
                      <tr key={t.transactionId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(t.transactionDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">{t.transactionReference}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.transactionType === 'Deposit' ? 'bg-emerald-50 text-emerald-700' :
                            t.transactionType === 'Withdrawal' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {t.transactionType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{t.description}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">
                          {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                No transactions recorded on this account yet.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal 3: Change Account Status (Freeze/Unfreeze/Close) */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Account Operational Status"
        subtitle={`Account: ${selectedAccount?.accountNumber} (Current Status: ${selectedAccount?.accountStatus})`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Account Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="Active">Active — Normal Deposits, Withdrawals & Transfers</option>
              <option value="Frozen">Frozen — Temporarily Block All Debits & Credits</option>
              <option value="Closed">Closed — Permanently Terminate Account (Balance must be 0)</option>
            </select>
          </div>

          {newStatus === 'Frozen' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Freezing this account will cause any subsequent withdrawal, deposit, or fund transfer to be immediately rejected by the transactional business rules.
            </div>
          )}

          {newStatus === 'Closed' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              Closing an account is irreversible. The account balance must be zero before closing. Current balance: <strong>{formatCurrency(selectedAccount?.balance)}</strong>.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
