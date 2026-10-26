import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Building2,
  MapPin,
  PlusCircle,
  Edit2,
  RefreshCw,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import { branchesApi } from '../services/api';
import Modal from '../components/Modal';

export default function BranchesPage({ showToast }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [formData, setFormData] = useState({
    branchName: '',
    ifscCode: '',
    branchAddress: '',
    city: 'Jaipur',
    state: 'Rajasthan',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await branchesApi.getAll();
      setBranches(res?.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      branchName: '',
      ifscCode: '',
      branchAddress: '',
      city: 'Jaipur',
      state: 'Rajasthan',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setSelectedBranch(b);
    setFormData({
      branchName: b.branchName,
      ifscCode: b.ifscCode,
      branchAddress: b.branchAddress,
      city: b.city,
      state: b.state,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!formData.branchName || !formData.ifscCode || !formData.branchAddress) {
      showToast('Please fill all required branch fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await branchesApi.create(formData);
      showToast('Branch registered successfully!', 'success');
      setIsAddModalOpen(false);
      fetchBranches();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await branchesApi.update(selectedBranch.branchId, formData);
      showToast('Branch information updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchBranches();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Branch Network Directory</h2>
          <p className="text-xs text-slate-500">Bank of Bagru branch network mapped across Jaipur and Rajasthan</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add New Branch Office</span>
        </button>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading branches from MySQL branches table...
          </div>
        ) : branches.map((b) => (
          <div key={b.branchId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{b.branchName}</h3>
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      IFSC: {b.ifscCode}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                  title="Edit Branch"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{b.branchAddress}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium pl-5">
                  {b.city}, {b.state}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Branch ID: #{b.branchId}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Active Operational</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Add Branch */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Branch Office"
        subtitle="Insert branch record with unique IFSC code into MySQL"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Sanganer Airport Branch"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code (Unique, 11 chars) *</label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              placeholder="e.g. BOB0000006"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address *</label>
            <textarea
              rows="2"
              value={formData.branchAddress}
              onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Street / Commercial Complex / Road"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Branch */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch Information"
        subtitle={`Branch ID: #${selectedBranch?.branchId}`}
      >
        <form onSubmit={handleUpdateBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code *</label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Address *</label>
            <textarea
              rows="2"
              value={formData.branchAddress}
              onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
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
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
