import { useState, useEffect } from 'react';
import api from '../api/axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTx, setEditingTx] = useState<any | null>(null);

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            const res = await api.get('/finance/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Delete Transaction
    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await api.delete(`/finance/transaction/${id}`);
            setTransactions(transactions.filter(tx => tx._id !== id));
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to delete');
        }
    };

    // Update Transaction
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTx) return;

        try {
            const { _id, ...data } = editingTx;
            const res = await api.put(`/finance/transaction/${_id}`, data);
            setTransactions(transactions.map(tx => (tx._id === _id ? res.data : tx)));
            setEditingTx(null);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to update');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Transactions History</h1>

            {error && <div className="text-[var(--color-danger)]">{error}</div>}

            <div className="glass-panel overflow-hidden">
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {transactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                                    {new Date(tx.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'revenue'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                                    {tx.category}
                                    {tx.fileUrl && (
                                        <a href={tx.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--color-primary)] hover:text-blue-400">
                                            (View Doc)
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                                    ₹{tx.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => setEditingTx(tx)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tx._id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingTx && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="glass-panel p-6 w-96 max-w-[90%] border border-white/10">
                        <h2 className="text-xl font-bold mb-6 text-[var(--color-text-main)]">Edit Transaction</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={editingTx.amount}
                                    onChange={e => setEditingTx({ ...editingTx, amount: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Category</label>
                                <input
                                    type="text"
                                    value={editingTx.category}
                                    onChange={e => setEditingTx({ ...editingTx, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)]"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setEditingTx(null)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
