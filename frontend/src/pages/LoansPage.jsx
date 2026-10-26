import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Search,
  PlusCircle,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  RefreshCw,
  Clock,
  Check,
  X,
  CreditCard,
  Building2,
  Calendar,
  Filter
} from 'lucide-react';
import { loansApi, customersApi, branchesApi } from '../services/api';
import Modal from '../components/Modal';

export default function LoansPage({ showToast }) {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');

  // Application form
  const [formData, setFormData] = useState({
    customerId: '',
    branchId: '',
    loanType: 'Home',
    principalAmount: '500000.00',
    interestRate: '8.50',
    tenureMonths: '60',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await loansApi.getAll({
        search,
        status: statusFilter === 'ALL' ? '' : statusFilter,
        loanType: typeFilter === 'ALL' ? '' : typeFilter,
      });
      setLoans(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        customersApi.getAll(),
        branchesApi.getAll(),
      ]);
      setCustomers(cRes?.data || []);
      setBranches(bRes?.data || []);
      if (cRes?.data?.length && !formData.customerId) {
        setFormData(prev => ({ ...prev, customerId: cRes.data[0].customerId }));
      }
      if (bRes?.data?.length && !formData.branchId) {
        setFormData(prev => ({ ...prev, branchId: bRes.data[0].branchId }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [statusFilter, typeFilter]);

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.branchId || !formData.principalAmount) {
      showToast('Please fill all required loan parameters.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await loansApi.apply({
        customerId: parseInt(formData.customerId),
        branchId: parseInt(formData.branchId),
        loanType: formData.loanType,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        tenureMonths: parseInt(formData.tenureMonths),
      });
      showToast('Loan application submitted for approval!', 'success');
      setIsApplyModalOpen(false);
      fetchLoans();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await loansApi.approve(id);
      showToast('Loan approved and disbursed successfully!', 'success');
      fetchLoans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await loansApi.reject(id);
      showToast('Loan application rejected.', 'info');
      fetchLoans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRepayment = async (e) => {
    e.preventDefault();
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      showToast('Please enter a valid repayment amount.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await loansApi.repay(selectedLoan.loanId, parseFloat(repayAmount));
      showToast(`Repayment of ₹${repayAmount} applied successfully!`, 'success');
      setIsRepayModalOpen(false);
      setRepayAmount('');
      fetchLoans();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  // Monthly EMI estimation calculation
  const calculateEstimatedEmi = () => {
    const P = parseFloat(formData.principalAmount) || 0;
    const r = (parseFloat(formData.interestRate) || 0) / 12 / 100;
    const n = parseInt(formData.tenureMonths) || 1;
    if (P === 0 || r === 0) return 0;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Loan Facilities & Credit Management</h2>
          <p className="text-xs text-slate-500">Underwrite loan applications, track outstanding principal, and process repayments</p>
        </div>

        <button
          onClick={() => {
            fetchLookups();
            setIsApplyModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Apply for Loan Facility</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={(e) => { e.preventDefault(); fetchLoans(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Loan ID or Customer Name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved / Active</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Loan Types</option>
            <option value="Home">Home Loan</option>
            <option value="Personal">Personal Loan</option>
            <option value="Education">Education Loan</option>
            <option value="Vehicle">Vehicle Loan</option>
          </select>

          <button
            onClick={fetchLoans}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Interest & Tenure</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading loans from MySQL loans table...
                  </td>
                </tr>
              ) : loans.length ? (
                loans.map((l) => (
                  <tr key={l.loanId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{l.loanId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {l.customer?.fullName}
                      <div className="text-[10px] text-slate-400 font-normal">{l.branch?.branchName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {l.loanType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(l.principalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(l.outstandingAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{l.interestRate}% p.a.</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.tenureMonths} Months</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        l.loanStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        l.loanStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        l.loanStatus === 'Closed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {l.loanStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {l.loanStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(l.loanId)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Approve Loan Application"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(l.loanId)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Reject Loan Application"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {l.loanStatus === 'Approved' && (
                        <button
                          onClick={() => {
                            setSelectedLoan(l);
                            setRepayAmount('10000.00');
                            setIsRepayModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200 transition-colors cursor-pointer"
                          title="Record Loan Repayment"
                        >
                          Repay
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedLoan(l);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="View Loan Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No loan applications found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Apply for Loan */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Loan Application"
        subtitle="Calculates interest and registers pending facility in MySQL"
      >
        <form onSubmit={handleApplyLoan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer Applicant *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriting Branch *</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose Branch Office --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName} ({b.ifscCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Category *</label>
              <select
                value={formData.loanType}
                onChange={(e) => {
                  const type = e.target.value;
                  let rate = '11.50';
                  if (type === 'Home') rate = '8.40';
                  if (type === 'Education') rate = '8.75';
                  if (type === 'Vehicle') rate = '9.20';
                  setFormData({ ...formData, loanType: type, interestRate: rate });
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Home">Home Loan (8.40%)</option>
                <option value="Education">Education Loan (8.75%)</option>
                <option value="Vehicle">Vehicle Loan (9.20%)</option>
                <option value="Personal">Personal Loan (11.50%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Amount (₹) *</label>
              <input
                type="number"
                step="1000"
                min="10000"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Interest Rate (%) *</label>
              <input
                type="number"
                step="0.05"
                min="1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tenure (Months) *</label>
              <input
                type="number"
                min="6"
                max="360"
                value={formData.tenureMonths}
                onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
          </div>

          {/* Quick EMI estimation calculation pill */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex justify-between items-center">
            <span>Estimated Monthly Repayment (EMI):</span>
            <span className="font-bold text-sm font-mono text-purple-800">
              {formatCurrency(calculateEstimatedEmi())} / month
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: View Loan Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Loan Facility Details"
        subtitle={`Loan Reference #${selectedLoan?.loanId} • ${selectedLoan?.loanType} Loan`}
      >
        {selectedLoan && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Applicant</span>
                <span className="font-bold text-slate-800">{selectedLoan.customer?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Processing Branch</span>
                <span className="font-semibold text-slate-800">{selectedLoan.branch?.branchName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Principal Sanctioned</span>
                <span className="font-bold font-mono text-slate-900">{formatCurrency(selectedLoan.principalAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Outstanding Amount</span>
                <span className="font-bold font-mono text-purple-700 text-sm">{formatCurrency(selectedLoan.outstandingAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Interest Rate</span>
                <span className="font-medium text-slate-800">{selectedLoan.interestRate}% per annum</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Tenure</span>
                <span className="font-medium text-slate-800">{selectedLoan.tenureMonths} Months</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Status</span>
                <span className="font-bold text-emerald-600">{selectedLoan.loanStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Application Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedLoan.applicationDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 3: Loan Repayment */}
      <Modal
        isOpen={isRepayModalOpen}
        onClose={() => setIsRepayModalOpen(false)}
        title="Process Loan Repayment"
        subtitle={`Loan #${selectedLoan?.loanId} (Outstanding: ${formatCurrency(selectedLoan?.outstandingAmount)})`}
      >
        <form onSubmit={handleRepayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repayment Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={selectedLoan?.outstandingAmount}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <p className="text-xs text-slate-500">
            This operation decreases the remaining outstanding balance. If the balance reaches ₹0.00, the loan status will automatically transition to <strong>Closed</strong>.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsRepayModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Applying Repayment...' : 'Confirm Repayment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
