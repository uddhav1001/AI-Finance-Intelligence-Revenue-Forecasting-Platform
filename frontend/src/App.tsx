import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvoiceUpload from './pages/InvoiceUpload';
import Reports from './pages/Reports';
import AuthCallback from './pages/AuthCallback';
import AICoach from './pages/AICoach';

import Layout from './components/Layout';
import Transactions from './pages/Transactions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes Wrapped in Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/ai-coach" element={<Layout><AICoach /></Layout>} />
        <Route path="/upload-invoice" element={<Layout><InvoiceUpload /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
