import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    // Feedback States
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/profile');
                setUser(response.data);
                setUsername(response.data.username);
                setEmail(response.data.email);
            } catch (error: any) {
                console.error('Failed to fetch profile', error);
                setMessage({ type: 'error', text: 'Failed to load profile details.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSaving(true);

        try {
            const response = await api.put('/user/profile', { username, email });
            setUser(prev => prev ? { ...prev, username: response.data.user.username, email: response.data.user.email } : null);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error: any) {
            console.error('Failed to update profile', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-8 text-3xl font-bold text-white">Profile Settings</h1>

            <div className="glass-panel overflow-hidden border-none rounded-xl dark:bg-slate-800/50 bg-white">
                <div className="border-b border-gray-200 dark:border-white/10 p-6 sm:p-8">
                    <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-3xl font-bold text-white shadow-lg">
                            {user?.username.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white text-gray-900">{user?.username}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {message.text && (
                        <div className={`mb-6 rounded-lg p-4 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-300 text-gray-700" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full rounded-lg border dark:border-white/10 border-gray-300 bg-transparent px-4 py-3 dark:text-white text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-300 text-gray-700" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-lg border dark:border-white/10 border-gray-300 bg-transparent px-4 py-3 dark:text-white text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? (
                                    <>
                                        <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Changes...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 sm:p-8 flex items-center justify-between border-t border-gray-200 dark:border-white/10 mt-4 rounded-b-xl">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sign Out</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ready to leave? Sign out of your account securely here.</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/10 px-6 py-3 text-sm font-medium text-red-600 dark:text-red-500 transition-all hover:bg-red-200 dark:hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
