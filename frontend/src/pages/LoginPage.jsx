import React, { useState } from 'react';
import { Landmark, Lock, User, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { authApi } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authApi.login(username.trim(), password.trim());
      if (response?.data) {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-navy-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4 border border-blue-400/30">
            <Landmark className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Bank of Bagru</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">Core Banking Management System • MySQL 8 RDBMS</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Employee Portal Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter authorized bank credentials to access system</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center">
              <span className="font-semibold mr-1">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Employee ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating with MySQL...</span>
              ) : (
                <>
                  <span>Sign In to Banking Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Demo Credentials</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Click to Autfill</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('teller', 'teller123')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Teller</div>
                <div className="text-[10px] text-slate-500 font-mono">teller123</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('manager', 'manager123')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Manager</div>
                <div className="text-[10px] text-slate-500 font-mono">manager123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Project Credits */}
        <div className="text-center mt-6 text-slate-400 text-xs flex items-center justify-center space-x-3">
          <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" /> BCrypt Auth</span>
          <span>•</span>
          <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1 text-emerald-400" /> MySQL 8.0 Engine</span>
          <span>•</span>
          <span>Spring Data JPA</span>
        </div>
      </div>
    </div>
  );
}
