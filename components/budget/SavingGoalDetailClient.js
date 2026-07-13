'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Download, Edit, Trash2, TrendingUp, Calendar, Target, Wallet as WalletIcon } from 'lucide-react';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import SavingGoalModal from './SavingGoalModal';
import SavingTransactionModal from './SavingTransactionModal';

export default function SavingGoalDetailClient({ goalId, userId }) {
  const router = useRouter();
  const { language } = usePreferences();
  const [savingGoal, setSavingGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Translations
  const t = {
    id: {
      back: 'Kembali',
      detail: 'Detail Target',
      currentBalance: 'Saldo Saat Ini',
      targetAmount: 'Target Akhir',
      achieved: 'Tercapai',
      remaining: 'Tersisa',
      deposit: '+ Isi Saldo',
      withdraw: '- Tarik Saldo',
      history: 'Riwayat Tabungan',
      viewAll: 'Lihat Semua',
      settings: 'Pengaturan Target',
      targetName: 'TARGET NOMINAL',
      targetDate: 'TARGET TANGGAL',
      category: 'KATEGORI',
      edit: 'Ubah Target',
      delete: 'Hapus Target Ini',
      deleteConfirm: 'Apakah Anda yakin ingin menghapus target tabungan ini?',
      success: 'BERHASIL',
      deposit_type: 'Setoran Bulanan',
      initial: 'Saldo Awal',
      loading: 'Memuat...',
      noHistory: 'Belum ada riwayat',
      goalActive: 'Goal Aktif',
    },
    en: {
      back: 'Back',
      detail: 'Target Detail',
      currentBalance: 'Current Balance',
      targetAmount: 'Target Amount',
      achieved: 'Achieved',
      remaining: 'Remaining',
      deposit: '+ Deposit',
      withdraw: '- Withdraw',
      history: 'Saving History',
      viewAll: 'View All',
      settings: 'Target Settings',
      targetName: 'TARGET NOMINAL',
      targetDate: 'TARGET DATE',
      category: 'CATEGORY',
      edit: 'Edit Target',
      delete: 'Delete This Target',
      deleteConfirm: 'Are you sure you want to delete this saving goal?',
      success: 'SUCCESS',
      deposit_type: 'Monthly Deposit',
      initial: 'Initial Balance',
      loading: 'Loading...',
      noHistory: 'No history yet',
      goalActive: 'Active Goal',
    }
  };

  const text = t[language] || t.id;

  useEffect(() => {
    fetchData();
  }, [goalId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch saving goal
      const goalRes = await fetch(`/api/saving-goals/${goalId}`);
      const goalData = await goalRes.json();
      setSavingGoal(goalData);

      // Fetch transactions
      const transRes = await fetch(`/api/saving-goals/${goalId}/transactions`);
      const transData = await transRes.json();
      setTransactions(transData);

      // Fetch wallets
      const walletsRes = await fetch('/api/wallets');
      const walletsData = await walletsRes.json();
      setWallets(walletsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(text.deleteConfirm)) return;

    try {
      const response = await fetch(`/api/saving-goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/budget');
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">{text.loading}</div>
      </div>
    );
  }

  if (!savingGoal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Target tidak ditemukan</div>
      </div>
    );
  }

  const percentage = savingGoal?.targetAmount > 0 
    ? Math.round((Number(savingGoal.savedAmount || 0) / Number(savingGoal.targetAmount)) * 100)
    : 0;

  const remaining = Number(savingGoal?.targetAmount || 0) - Number(savingGoal?.savedAmount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/budget')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{text.detail}: {savingGoal?.name || 'Target'}</h1>
          <p className="text-slate-600 mt-1">Pantau kemajuan investasi {savingGoal?.name?.toLowerCase() || 'target'} Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card - Saldo dan Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Goal Active Badge */}
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-bold text-sm border border-white/30">
              ✓ {text.goalActive}
            </div>

            <div className="relative z-10">
              <p className="text-white/80 text-sm font-bold mb-2">{text.currentBalance}</p>
              <h2 className="text-5xl font-black mb-2">{formatCurrency(savingGoal?.savedAmount || 0)}</h2>
              
              <div className="flex items-center justify-between mt-6 mb-4">
                <div>
                  <p className="text-white/70 text-xs font-bold mb-1">{percentage}% {text.achieved}</p>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-8 text-right">
                  <p className="text-white/70 text-xs font-bold">{text.targetAmount}</p>
                  <p className="text-2xl font-black">{formatCurrency(savingGoal?.targetAmount || 0)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span className="text-white/90">Target: {formatDate(savingGoal?.targetDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <Plus className="w-5 h-5" />
              {text.deposit}
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white border-2 border-slate-300 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              {text.withdraw}
            </button>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900">{text.history}</h3>
              <button className="text-[#6366F1] font-bold text-sm hover:underline">
                {text.viewAll}
              </button>
            </div>

            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((trans) => (
                  <div key={trans.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        trans.type === 'deposit' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {trans.type === 'deposit' ? (
                          <Plus className={`w-6 h-6 text-green-600`} />
                        ) : (
                          <Download className={`w-6 h-6 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{trans.note || (trans.type === 'deposit' ? text.deposit_type : text.withdraw)}</p>
                        <p className="text-sm text-slate-500">{formatDate(trans.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${
                        trans.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trans.type === 'deposit' ? '+' : '-'} {formatCurrency(trans.amount)}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold">{text.success}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">{text.noHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Settings */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border-2 border-slate-200 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">{text.settings}</h3>

            <div className="space-y-4">
              {/* Target Nominal */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">{text.targetName}</p>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#6366F1]" />
                  <p className="text-lg font-black text-slate-900">{formatCurrency(savingGoal?.targetAmount || 0)}</p>
                </div>
              </div>

              {/* Target Date */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">{text.targetDate}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#6366F1]" />
                  <p className="text-lg font-black text-slate-900">{formatDate(savingGoal?.targetDate)}</p>
                </div>
              </div>

              {/* Wallet */}
              {savingGoal?.wallet && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-1">DOMPET</p>
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-[#6366F1]" />
                    <p className="text-lg font-black text-slate-900">{savingGoal?.wallet?.name || '-'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5558E3] transition-all"
                >
                  <Edit className="w-4 h-4" />
                  {text.edit}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  {text.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <SavingGoalModal
          savingGoal={savingGoal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchData();
          }}
        />
      )}

      {showDepositModal && (
        <SavingTransactionModal
          type="deposit"
          savingGoal={savingGoal}
          wallets={wallets}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            setShowDepositModal(false);
            fetchData();
          }}
        />
      )}

      {showWithdrawModal && (
        <SavingTransactionModal
          type="withdraw"
          savingGoal={savingGoal}
          wallets={wallets}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
