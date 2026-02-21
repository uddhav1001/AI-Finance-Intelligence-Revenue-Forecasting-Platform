import { useState } from 'react';
import api from '../api/axios';

interface TransactionFormProps {
    onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        paymentMethod: 'Cash',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/finance/transaction', formData);
            setFormData({
                type: 'expense',
                amount: '',
                category: '',
                paymentMethod: 'Cash',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 border-none">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Add New Transaction</h3>

            {error && <div className="p-3 mb-4 text-sm text-[var(--color-danger)] bg-[rgba(239,68,68,0.1)] rounded-lg border border-[var(--color-danger)]">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selection */}
                <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="expense"
                            checked={formData.type === 'expense'}
                            onChange={handleChange}
                            className="form-radio text-[var(--color-danger)] bg-slate-800/50 border-white/10 h-4 w-4"
                        />
                        <span className="ml-2 text-[var(--color-text-main)]">Expense</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="revenue"
                            checked={formData.type === 'revenue'}
                            onChange={handleChange}
                            className="form-radio text-[var(--color-accent)] bg-slate-800/50 border-white/10 h-4 w-4"
                        />
                        <span className="ml-2 text-[var(--color-text-main)]">Revenue</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)] placeholder-slate-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Category</label>
                        <input /* Could be a select, but text for flexibility for now */
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)] placeholder-slate-500"
                            placeholder="e.g. Salary, Rent, Sales"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)]"
                        >
                            <option value="Cash" className="bg-slate-800">Cash</option>
                            <option value="Bank" className="bg-slate-800">Bank Transfer</option>
                            <option value="UPI" className="bg-slate-800">UPI</option>
                            <option value="Card" className="bg-slate-800">Card</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Description / Notes</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-text-main)] placeholder-slate-500"
                        placeholder="Add some notes..."
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
