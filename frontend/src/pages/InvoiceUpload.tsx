import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const InvoiceUpload = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('revenue');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parsing, setParsing] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            const formData = new FormData();
            formData.append('invoice', selectedFile);

            setParsing(true);
            setError('');

            try {
                const res = await api.post('/ai/parse-invoice', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (res.data.amount) setAmount(res.data.amount.toString());
                if (res.data.store) {
                    setDescription(`Invoice from ${res.data.store}`);
                    if (!category) setCategory(res.data.store.toUpperCase());
                }
                setType('revenue'); // Force revenue for B-Mart type invoices
                if (res.data.fileUrl) setFileUrl(res.data.fileUrl);

            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to auto-parse invoice automatically.');
            } finally {
                setParsing(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('type', type);
        formData.append('category', category);
        formData.append('amount', amount);
        formData.append('description', description);
        formData.append('date', date);
        if (fileUrl) {
            formData.append('fileUrl', fileUrl);
        } else if (file) {
            formData.append('invoice', file);
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            await api.post('/finance/transaction', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to upload invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-main)]">
                    Upload Invoice
                </h2>
                <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
                    Add a transaction with supporting document and auto-extraction
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-panel border-none py-8 px-4 shadow sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 text-sm text-[var(--color-danger)] bg-[rgba(239,68,68,0.1)] rounded-lg border border-[var(--color-danger)]" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                                Invoice File (Image or PDF)
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-md hover:border-[var(--color-primary)] bg-slate-800/20 transition-colors">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-slate-500"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-[var(--color-text-main)] justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-medium text-[var(--color-primary)] hover:text-blue-400 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                                disabled={parsing}
                                            />
                                        </label>
                                        <p className="pl-1 text-[var(--color-text-muted)]">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG, PDF up to 5MB</p>
                                    {file && (
                                        <p className="text-sm text-[var(--color-accent)] font-medium mt-2">
                                            Selected: {file.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Extracted Details Card */}
                        {(amount !== '' || parsing) && (
                            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center">
                                    <span className="mr-2">✨</span> AI Extraction Result
                                </h4>
                                {parsing ? (
                                    <div className="flex items-center text-sm text-emerald-400/70 animate-pulse font-medium">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing your invoice...
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center transition-all duration-300">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold text-[var(--color-text-main)]">₹{amount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">Detected Category</p>
                                            <p className="text-md font-medium text-[var(--color-text-main)]">{description ? description.replace('Invoice from ', '') : category.toUpperCase()}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                                {type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Amount Field (Editable fallback) */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-[var(--color-text-muted)]">
                                Final Amount (Verify)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                step="0.01"
                                className="mt-1 block w-full outline-none bg-slate-800/50 border border-white/10 focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm rounded-lg text-[var(--color-text-main)] px-4 py-2"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)]">Transaction Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base outline-none bg-slate-800/50 border border-white/10 focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm rounded-lg text-[var(--color-text-main)]"
                            >
                                <option value="revenue" className="bg-slate-800">Revenue</option>
                                <option value="expense" className="bg-slate-800">Expense</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-[var(--color-text-muted)]">
                                Category Tag
                            </label>
                            <input
                                type="text"
                                name="category"
                                id="category"
                                className="mt-1 block w-full outline-none bg-slate-800/50 border border-white/10 focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm rounded-lg text-[var(--color-text-main)] placeholder-slate-500 uppercase px-4 py-2"
                                placeholder="e.g. B-MART, GROCERY"
                                value={category}
                                onChange={(e) => setCategory(e.target.value?.toUpperCase())}
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-[var(--color-text-muted)]">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                className="mt-1 block w-full outline-none bg-slate-800/50 border border-white/10 focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm rounded-lg text-[var(--color-text-main)] px-4 py-2 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-between space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm text-sm font-medium text-slate-300 bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || parsing}
                                className={`w-full flex justify-center py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:-translate-y-0.5 transition-all ${(loading || parsing) ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving...' : 'Confirm Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InvoiceUpload;
