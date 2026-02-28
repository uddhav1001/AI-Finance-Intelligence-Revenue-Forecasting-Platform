import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AICoach from './pages/AICoach';
import InvoiceUpload from './pages/InvoiceUpload';

import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Layout wrapper component that includes Sidebar
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex bg-[#0a0a0a] min-h-screen relative overflow-hidden text-white font-sans">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {/* Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className={`flex-1 overflow-x-hidden min-h-screen transition-all duration-300 z-10 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="glass-panel min-h-full border border-glass-border">
          <div className="max-w-7xl mx-auto h-full p-6 lg:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/ai-coach" element={<PrivateRoute><Layout><AICoach /></Layout></PrivateRoute>} />
        <Route path="/upload-invoice" element={<PrivateRoute><Layout><InvoiceUpload /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
