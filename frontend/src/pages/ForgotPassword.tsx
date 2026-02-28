import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(response.data.message || 'Check your email for a reset link.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px]" />

            <div className="w-full max-w-md p-8 bg-glass border border-glass-border rounded-2xl shadow-2xl backdrop-blur-xl z-10 relative">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        Reset Password
                    </h1>
                    <p className="text-gray-400">Enter your email to receive a reset link</p>
                </div>

                {status === 'error' && <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg">{message}</div>}

                {status === 'success' ? (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200">
                            {message}
                        </div>
                        <Link to="/login" className="block w-full px-4 py-3 font-bold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
                            Return to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                                placeholder="name@company.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="mt-6 text-sm text-center text-gray-400">
                            Remembered your password?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
