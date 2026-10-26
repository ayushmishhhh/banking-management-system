import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import BranchesPage from './pages/BranchesPage';
import LoansPage from './pages/LoansPage';
import ReportsPage from './pages/ReportsPage';
import DatabaseInfoPage from './pages/DatabaseInfoPage';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: 'success' });
  };

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('bob_user');
    const savedToken = localStorage.getItem('bob_token');
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bob_user');
        localStorage.removeItem('bob_token');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('bob_user', JSON.stringify(userData));
    localStorage.setItem('bob_token', userData.token);
    showToast(`Welcome back, ${userData.fullName || userData.username}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bob_user');
    localStorage.removeItem('bob_token');
    showToast('Signed out of banking portal.', 'info');
  };

  // If not authenticated, show professional Login page
  if (!currentUser) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Navy Blue Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <div className="relative">
          <Navbar
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={activeTab}
          />
          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden absolute left-4 top-3.5 p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              showToast={showToast}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsPage
              showToast={showToast}
              onNavigateToTxn={() => setActiveTab('transactions')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              showToast={showToast}
            />
          )}

          {activeTab === 'branches' && (
            <BranchesPage
              showToast={showToast}
            />
          )}

          {activeTab === 'loans' && (
            <LoansPage
              showToast={showToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              showToast={showToast}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseInfoPage
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}
