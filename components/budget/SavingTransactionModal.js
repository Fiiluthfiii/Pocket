'use client';

import { useState } from 'react';
import { X, Plus, Download } from 'lucide-react';
import { usePreferences } from '@/components/providers/PreferencesProvider';

export default function SavingTransactionModal({ type, savingGoal, wallets, onClose, onSuccess }) {
  const { language } = usePreferences();
  
  // Get current date in local timezone
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    walletId: savingGoal.walletId || (wallets.length > 0 ? wallets[0].id : ''),
    amount: '',
    note: '',
    date: getCurrentDate(),
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    id: {
      deposit: 'Isi Saldo',
      withdraw: 'Tarik Saldo',
      selectWallet: 'Pilih Dompet',
      amount: 'Jumlah (Rp)',
      note: 'Catatan (Opsional)',
      date: 'Tanggal',
      cancel: 'Batal',
      submit: 'Simpan',
      saving: 'Menyimpan...',
      depositNote: 'Uang akan diambil dari dompet yang dipilih',
      withdrawNote: 'Uang akan dikembalikan ke dompet yang dipilih',
      insufficientBalance: 'Saldo dompet tidak cukup',
      insufficientSaved: 'Saldo tabungan tidak cukup',
    },
    en: {
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      selectWallet: 'Select Wallet',
      amount: 'Amount (Rp)',
      note: 'Note (Optional)',
      date: 'Date',
      cancel: 'Cancel',
      submit: 'Submit',
      saving: 'Saving...',
      depositNote: 'Money will be taken from the selected wallet',
      withdrawNote: 'Money will be returned to the selected wallet',
      insufficientBalance: 'Insufficient wallet balance',
      insufficientSaved: 'Insufficient saved amount',
    }
  };

  const text = t[language] || t.id;

  // Format number dengan pemisah ribuan (titik)
  const formatNumber = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle perubahan input amount
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numberOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, amount: numberOnly });
    setDisplayAmount(formatNumber(numberOnly));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const selectedWallet = wallets.find(w => w.id === formData.walletId);
      const amount = Number(formData.amount);

      // Validasi
      if (type === 'deposit' && selectedWallet.balance < amount) {
        setError(text.insufficientBalance);
        setLoading(false);
        return;
      }

      if (type === 'withdraw' && savingGoal.savedAmount < amount) {
        setError(text.insufficientSaved);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/saving-goals/${savingGoal.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save transaction');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {type === 'deposit' ? (
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900">
              {type === 'deposit' ? text.deposit : text.withdraw}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {text.selectWallet}
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              value={formData.walletId}
              onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
              required
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - Rp {Number(wallet.balance).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {type === 'deposit' ? text.depositNote : text.withdrawNote}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {text.amount}
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              placeholder="50.000"
              value={displayAmount}
              onChange={handleAmountChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {text.date}
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {text.note}
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none"
              placeholder="Setoran bulanan, Transfer bank, dll..."
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 ${
                type === 'deposit' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              } text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50`}
            >
              {loading ? text.saving : text.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
