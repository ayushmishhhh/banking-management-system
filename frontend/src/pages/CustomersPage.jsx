import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Wallet,
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { customersApi, accountsApi, loansApi } from '../services/api';
import Modal from '../components/Modal';

export default function CustomersPage({ showToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected customer & linked records for detail modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await customersApi.getAll(searchQuery);
      if (res?.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchCustomers('');
  };

  // Open view modal & fetch linked accounts and loans
  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setIsViewModalOpen(true);
    setLoadingDetails(true);
    try {
      const [accRes, loanRes] = await Promise.all([
        accountsApi.getByCustomer(cust.customerId),
        loansApi.getAll({ search: cust.customerId.toString() })
      ]);
      setCustomerAccounts(accRes?.data || []);
      // Filter loans strictly for this customer
      const filteredLoans = (loanRes?.data || []).filter(l => l.customer?.customerId === cust.customerId);
      setCustomerLoans(filteredLoans);
    } catch (err) {
      showToast('Error loading customer relationship data: ' + err.message, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      address: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      fullName: cust.fullName || '',
      dateOfBirth: cust.dateOfBirth || '',
      email: cust.email || '',
      phone: cust.phone || '',
      address: cust.address || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) errs.phone = '10-digit phone number is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await customersApi.create(formData);
      showToast('Customer registered successfully!', 'success');
      setIsAddModalOpen(false);
      fetchCustomers(search);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await customersApi.update(selectedCustomer.customerId, formData);
      showToast('Customer information updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchCustomers(search);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      setSubmitting(true);
      await customersApi.delete(selectedCustomer.customerId);
      showToast('Customer record deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      fetchCustomers(search);
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
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Management</h2>
          <p className="text-xs text-slate-500">Maintain KYC customer profiles and view cross-table account portfolios</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, email, phone number, or Customer ID..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => fetchCustomers(search)}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
              title="Refresh Customer List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Accounts</th>
                <th className="py-3 px-4">Active Loans</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading customers from MySQL...
                  </td>
                </tr>
              ) : customers.length ? (
                customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #{c.customerId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {c.fullName}
                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{c.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-slate-600 text-[11px]">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" /> {c.email}
                      </div>
                      <div className="flex items-center text-slate-600 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" /> {c.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {c.dateOfBirth}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {c.accountsCount || 0} Account(s)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        (c.activeLoansCount || 0) > 0 ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.activeLoansCount || 0} Loan(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewCustomer(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="View Full Customer Portfolio"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register Customer */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer"
        subtitle="Insert a new row into MySQL customers table with unique constraints"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="e.g. Ramesh Chandra Sharma"
            />
            {formErrors.fullName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {formErrors.dateOfBirth && <p className="text-[11px] text-rose-600 mt-1">{formErrors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">10-Digit Mobile Phone *</label>
              <input
                type="text"
                maxLength="10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                placeholder="e.g. 9829012345"
              />
              {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Unique) *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="e.g. ramesh.sharma@example.com"
            />
            {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="House No, Street, Landmark, Bagru/Jaipur"
            />
            {formErrors.address && <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Customer Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Customer */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Customer Profile"
        subtitle={`Modify information for Customer #${selectedCustomer?.customerId}`}
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.fullName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="text"
                maxLength="10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving Changes...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: View Customer Details & Relational Portfolio */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Customer Relationship Portfolio"
        subtitle={`RDBMS Cross-Table View for ${selectedCustomer?.fullName} (ID #${selectedCustomer?.customerId})`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Customer Metadata Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Customer ID</span>
              <span className="font-bold text-slate-900 font-mono">#{selectedCustomer?.customerId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date of Birth</span>
              <span className="font-medium text-slate-800">{selectedCustomer?.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email</span>
              <span className="font-medium text-slate-800">{selectedCustomer?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Phone</span>
              <span className="font-medium text-slate-800 font-mono">{selectedCustomer?.phone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Address</span>
              <span className="font-medium text-slate-800">{selectedCustomer?.address}</span>
            </div>
          </div>

          {/* Linked Bank Accounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Wallet className="w-4 h-4 mr-1 text-blue-600" />
                Linked Bank Accounts ({customerAccounts.length})
              </h4>
            </div>

            {loadingDetails ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading accounts...</div>
            ) : customerAccounts.length ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Account Number</th>
                      <th className="py-2 px-3">Branch / IFSC</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerAccounts.map((acc) => (
                      <tr key={acc.accountId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{acc.accountNumber}</td>
                        <td className="py-2 px-3 text-slate-600">{acc.branchName} ({acc.ifscCode})</td>
                        <td className="py-2 px-3 font-medium text-slate-700">{acc.accountType}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(acc.balance)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            acc.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {acc.accountStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                No bank accounts currently opened for this customer.
              </div>
            )}
          </div>

          {/* Linked Loans */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Banknote className="w-4 h-4 mr-1 text-purple-600" />
                Loan Applications & Facilities ({customerLoans.length})
              </h4>
            </div>

            {loadingDetails ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading loans...</div>
            ) : customerLoans.length ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Loan ID</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Principal</th>
                      <th className="py-2 px-3 text-right">Outstanding</th>
                      <th className="py-2 px-3">Rate & Tenure</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerLoans.map((l) => (
                      <tr key={l.loanId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">#{l.loanId}</td>
                        <td className="py-2 px-3 font-medium text-slate-700">{l.loanType}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(l.principalAmount)}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono text-purple-700">{formatCurrency(l.outstandingAmount)}</td>
                        <td className="py-2 px-3 text-slate-600">{l.interestRate}% ({l.tenureMonths}m)</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            l.loanStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            l.loanStatus === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {l.loanStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                No loan records found for this customer.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal 4: Delete Customer Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Customer Deletion"
        subtitle="Referential Integrity & Foreign Key Enforcement"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Banking Constraint Check:</p>
              <p className="mt-1">
                You are requesting to delete customer record <strong>{selectedCustomer?.fullName}</strong> (ID #{selectedCustomer?.customerId}).
              </p>
              <p className="mt-1 text-[11px] text-amber-700">
                In compliance with database referential integrity rules (ON DELETE RESTRICT), this deletion will be <strong>strictly rejected</strong> if the customer holds open bank accounts or active loans.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCustomer}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Verifying & Deleting...' : 'Confirm Deletion'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
