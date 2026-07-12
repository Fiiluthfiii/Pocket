'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const WALLET_TYPES = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank', label: 'Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'credit', label: 'Kartu Kredit' },
  { value: 'other', label: 'Lainnya' },
];

export default function WalletModal({ wallet, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    balance: '',
  });
  const [displayBalance, setDisplayBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet) {
      const balance = wallet.balance.toString();
      setFormData({
        name: wallet.name,
        type: wallet.type,
        balance: balance,
      });
      setDisplayBalance(formatNumber(balance));
    }
  }, [wallet]);

  // Format number dengan pemisah ribuan (titik)
  const formatNumber = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle perubahan input balance
  const handleBalanceChange = (e) => {
    const value = e.target.value;
    const numberOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, balance: numberOnly });
    setDisplayBalance(formatNumber(numberOnly));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = wallet
        ? `/api/wallets/${wallet.id}`
        : '/api/wallets';

      const method = wallet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan dompet');
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
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {wallet ? 'Edit Dompet' : 'Tambah Dompet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Nama Dompet</label>
            <input
              type="text"
              className="input"
              placeholder="Misal: Dompet Utama, BCA, GoPay"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="label">Tipe Dompet</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {WALLET_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="label">Saldo Awal (Rp)</label>
            <input
              type="text"
              className="input"
              placeholder="0"
              value={displayBalance}
              onChange={handleBalanceChange}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Masukkan saldo yang ada di dompet ini saat ini
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
