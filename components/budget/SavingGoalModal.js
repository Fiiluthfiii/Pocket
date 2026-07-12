'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SavingGoalModal({ savingGoal, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
  });
  const [displayTargetAmount, setDisplayTargetAmount] = useState('');
  const [displaySavedAmount, setDisplaySavedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (savingGoal) {
      const targetAmt = Number(savingGoal.targetAmount).toString();
      const savedAmt = Number(savingGoal.savedAmount).toString();
      setFormData({
        name: savingGoal.name,
        targetAmount: targetAmt,
        savedAmount: savedAmt,
        targetDate: new Date(savingGoal.targetDate).toISOString().split('T')[0],
      });
      setDisplayTargetAmount(formatNumber(targetAmt));
      setDisplaySavedAmount(formatNumber(savedAmt));
    }
  }, [savingGoal]);

  // Format number dengan pemisah ribuan (titik)
  const formatNumber = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle perubahan input target amount
  const handleTargetAmountChange = (e) => {
    const value = e.target.value;
    const numberOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, targetAmount: numberOnly });
    setDisplayTargetAmount(formatNumber(numberOnly));
  };

  // Handle perubahan input saved amount
  const handleSavedAmountChange = (e) => {
    const value = e.target.value;
    const numberOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, savedAmount: numberOnly });
    setDisplaySavedAmount(formatNumber(numberOnly));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = savingGoal 
        ? `/api/saving-goals/${savingGoal.id}`
        : '/api/saving-goals';
      
      const method = savingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save saving goal');
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
          <h2 className="text-2xl font-bold text-slate-900">
            {savingGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan'}
          </h2>
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
              Nama Target
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              placeholder="Contoh: MacBook Pro M3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target Amount (Rp)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              placeholder="32.000.000"
              value={displayTargetAmount}
              onChange={handleTargetAmountChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sudah Terkumpul (Rp)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              placeholder="24.000.000"
              value={displaySavedAmount}
              onChange={handleSavedAmountChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target Tanggal
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : savingGoal ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
