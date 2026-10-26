import React from 'react';
import { Building2, User, LogOut, ShieldCheck, Landmark } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, activeTab }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-navy-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Bank of Bagru</h1>
            <p className="text-xs text-slate-500 font-medium">Core Banking Portal • Jaipur Region</p>
          </div>
        </div>
        <div className="hidden md:flex items-center ml-8 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          RDBMS Project System
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{currentUser.fullName || currentUser.username}</div>
              <div className="text-[10px] text-blue-600 font-medium">{currentUser.role?.replace('ROLE_', '') || 'EMPLOYEE'}</div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          title="Sign Out of Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
