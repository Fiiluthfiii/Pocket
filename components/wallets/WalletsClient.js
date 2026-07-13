'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wallet, CreditCard, Banknote, Smartphone, Search, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import WalletModal from './WalletModal';
import { usePreferences } from '@/components/providers/PreferencesProvider';

const WALLET_ICONS = {
  cash: Banknote,
  bank: CreditCard,
  'e-wallet': Smartphone,
  credit: CreditCard,
  other: Wallet,
};

const WALLET_COLORS = {
  'Bank BCA': '#3B82F6',
  'Bank Mandiri': '#10B981',
  'GoPay': '#10B981',
  'E-Wallet': '#EC4899',
  'Tunai (Cash)': '#F59E0B',
};

export default function WalletsClient({ userId }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = usePreferences();

  // Translations
  const t = {
    id: {
      search: 'Cari dompet atau rekening...',
      addWallet: 'Tambah Dompet',
      title: 'Dompet & Rekening',
      subtitle: 'Kelola semua aset Anda dalam satu tempat.',
      totalBalance: 'TOTAL SALDO GABUNGAN',
      institutionAllocation: 'Alokasi Institusi',
      allocationSubtitle: 'Distribusi aset berdasarkan bank & e-wallet',
      institutions: 'Institusi',
      main: 'Utama',
      noData: 'Belum ada data',
      walletList: 'Daftar Dompet',
      activeWallets: 'dompet aktif',
      totalBalanceText: 'Total saldo',
      balance: 'SALDO',
      noWallets: 'Belum ada dompet',
      addFirstWallet: 'Tambah Dompet Pertama',
      loading: 'Memuat...',
      deleteConfirm: 'Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait akan terhapus.',
      deleteLastWallet: 'Tidak bisa menghapus dompet terakhir. Minimal 1 dompet harus ada.',
    },
    en: {
      search: 'Search wallet or account...',
      addWallet: 'Add Wallet',
      title: 'Wallets & Accounts',
      subtitle: 'Manage all your assets in one place.',
      totalBalance: 'TOTAL COMBINED BALANCE',
      institutionAllocation: 'Institution Allocation',
      allocationSubtitle: 'Asset distribution by bank & e-wallet',
      institutions: 'Institutions',
      main: 'Main',
      noData: 'No data yet',
      walletList: 'Wallet List',
      activeWallets: 'active wallets',
      totalBalanceText: 'Total balance',
      balance: 'BALANCE',
      noWallets: 'No wallets yet',
      addFirstWallet: 'Add First Wallet',
      loading: 'Loading...',
      deleteConfirm: 'Are you sure you want to delete this wallet? All related transactions will be deleted.',
      deleteLastWallet: 'Cannot delete last wallet. At least 1 wallet must exist.',
    }
  };

  const text = t[language] || t.id;

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets');
      const data = await response.json();
      setWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleDelete = async (id) => {
    if (wallets.length === 1) {
      alert(text.deleteLastWallet);
      return;
    }

    if (!confirm(text.deleteConfirm)) return;

    try {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWallets();
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  const handleAddWallet = () => {
    setEditingWallet(null);
    setShowModal(true);
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet);
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  // Prepare data for pie chart
  const chartData = wallets.map(wallet => ({
    name: wallet.name,
    value: wallet.balance,
    color: WALLET_COLORS[wallet.name] || '#6366F1'
  }));

  // Filter wallets
  const filteredWallets = wallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">{text.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative">
        {/* Decorative background for header */}
        <div className="absolute -inset-3 bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-pink-100/50 rounded-2xl blur-xl -z-10 pointer-events-none"></div>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md group">
          {/* Glow effect behind search */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
          
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder={text.search}
            className="relative w-full pl-12 pr-4 py-3 bg-gradient-to-r from-white via-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Sparkles on search bar */}
          <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-2 right-8 w-1 h-1 bg-pink-400 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddWallet}
            className="bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-110 transition-all flex items-center gap-2 shadow-xl relative overflow-hidden group"
            type="button"
          >
            {/* Multiple animated effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 pointer-events-none"></div>
            
            {/* Sparkles on button */}
            <div className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
            
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{text.addWallet}</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative">
        {/* Animated background */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-pink-200/40 rounded-3xl blur-2xl pointer-events-none"></div>
        <div className="absolute -inset-2 bg-gradient-to-br from-indigo-200/30 via-violet-200/30 to-fuchsia-200/30 rounded-3xl blur-xl pointer-events-none"></div>
        
        <div className="relative bg-gradient-to-r from-slate-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
          {/* Sparkles */}
          <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg pointer-events-none"></div>
          <div className="absolute top-6 right-16 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-4 left-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-6 left-16 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.7s' }}></div>
          
          <h1 className="text-3xl font-black text-slate-900 relative z-10">{text.title}</h1>
          <p className="text-slate-600 mt-1 font-medium relative z-10">
            {text.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Saldo Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          {/* Animated decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-20 right-40 w-2 h-2 bg-white rounded-full animate-pulse pointer-events-none"></div>
          <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-32 right-20 w-2.5 h-2.5 bg-white rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute top-32 left-40 w-1 h-1 bg-white rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
          
          {/* Button Tambah Dompet */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleAddWallet}
              type="button"
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-bold hover:bg-white/30 hover:scale-105 transition-all flex items-center gap-2 border border-white/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {text.addWallet}
            </button>
          </div>

          <div className="relative z-10">
            <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">{text.totalBalance}</p>
            <h2 className="text-4xl font-black mb-8 drop-shadow-lg">
              {formatCurrency(totalBalance)}
            </h2>
          </div>
        </div>

        {/* Alokasi Institusi */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200 shadow-xl relative overflow-hidden">
          {/* Decorative circles dengan animasi berbeda */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-blue-300/40 to-purple-300/40 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-xl pointer-events-none"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-12 right-16 w-2 h-2 bg-yellow-400 rounded-full animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-20 left-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-20 left-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-12 right-20 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-slate-900 mb-1">{text.institutionAllocation}</h3>
            <p className="text-sm text-slate-600 mb-6 font-medium">{text.allocationSubtitle}</p>

          {chartData.length > 0 ? (
            <div>
              {/* Donut Chart with glow effect */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                {/* Glow effect behind chart */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-slate-600 font-bold">{text.institutions}</p>
                  <p className="text-xl font-black text-slate-900">{wallets.length} {text.main}</p>
                </div>
              </div>

              {/* Legend with gradient backgrounds */}
              <div className="space-y-3">
                {chartData.map((item, index) => {
                  const percentage = totalBalance > 0 ? Math.round((item.value / totalBalance) * 100) : 0;
                  
                  // Different gradient backgrounds for each item
                  const gradients = [
                    'from-purple-100 to-pink-100',
                    'from-blue-100 to-indigo-100',
                    'from-indigo-100 to-purple-100',
                    'from-pink-100 to-rose-100',
                    'from-violet-100 to-purple-100',
                  ];
                  
                  return (
                    <div key={index} className={`flex items-center justify-between bg-gradient-to-r ${gradients[index % 5]} px-4 py-3 rounded-xl border border-white/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-102 transition-all relative overflow-hidden group`}>
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        <div 
                          className="w-3 h-3 rounded-full shadow-md animate-pulse pointer-events-none" 
                          style={{ backgroundColor: item.color, animationDelay: `${index * 0.2}s` }}
                        ></div>
                        <span className="text-sm text-slate-900 font-bold">{item.name}</span>
                      </div>
                      <span className="text-base font-black text-slate-900 relative z-10">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <Wallet className="w-12 h-12 mb-2 relative z-10 pointer-events-none" />
              <p className="relative z-10 font-semibold">{text.noData}</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Daftar Dompet */}
      <div className="relative">
        {/* Multiple decorative backgrounds dengan animasi berbeda */}
        <div className="absolute -inset-6 bg-gradient-to-r from-purple-200/40 via-pink-200/40 to-blue-200/40 rounded-3xl blur-3xl animate-pulse"></div>
        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-200/30 via-purple-200/30 to-pink-200/30 rounded-3xl blur-2xl pointer-events-none opacity-60"></div>
        <div className="absolute -inset-3 bg-gradient-to-l from-blue-200/20 via-violet-200/20 to-fuchsia-200/20 rounded-3xl blur-xl pointer-events-none opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-xl relative overflow-hidden group">
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-pink-100/30 animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            {/* Sparkles banyak */}
            <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-lg pointer-events-none"></div>
            <div className="absolute top-5 right-20 w-1 h-1 bg-pink-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-3 left-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-5 left-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-900">{text.walletList}</h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {filteredWallets.length} {text.activeWallets} • {text.totalBalanceText} {formatCurrency(totalBalance)}
              </p>
            </div>
            
            {/* Decorative animated dots */}
            <div className="flex gap-3 relative z-10 pointer-events-none">
              <div className="flex flex-col gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>
              </div>
            </div>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWallets.map((wallet, index) => {
            const Icon = WALLET_ICONS[wallet.type] || Wallet;
            const color = WALLET_COLORS[wallet.name] || '#6366F1';
            
            // 6 COMPLETELY DIFFERENT animation patterns - HANYA PULSE untuk menghindari scroll issue
            const animationPatterns = [
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-blue-50 via-indigo-50 to-purple-50',
                border: 'border-blue-300',
                shadow: 'hover:shadow-blue-400/50'
              },
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-purple-50 via-pink-50 to-rose-50',
                border: 'border-pink-300',
                shadow: 'hover:shadow-pink-400/50'
              },
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-green-50 via-emerald-50 to-teal-50',
                border: 'border-emerald-300',
                shadow: 'hover:shadow-emerald-400/50'
              },
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-orange-50 via-amber-50 to-yellow-50',
                border: 'border-amber-300',
                shadow: 'hover:shadow-amber-400/50'
              },
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-pink-50 via-rose-50 to-red-50',
                border: 'border-rose-300',
                shadow: 'hover:shadow-rose-400/50'
              },
              { 
                circles: ['animate-pulse', 'animate-pulse', 'animate-pulse', 'animate-pulse'], 
                gradient: 'from-cyan-50 via-blue-50 to-indigo-50',
                border: 'border-cyan-300',
                shadow: 'hover:shadow-cyan-400/50'
              },
            ];
            const pattern = animationPatterns[index % 6];
            
            return (
              <div
                key={wallet.id}
                className={`bg-gradient-to-br ${pattern.gradient} rounded-2xl p-6 border-2 ${pattern.border} hover:shadow-2xl ${pattern.shadow} hover:scale-105 hover:border-opacity-100 transition-all duration-300 relative group overflow-hidden will-change-transform`}
              >
                {/* Main decorative layer dengan gradient yang lebih intense */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none"></div>
                
                {/* 5 animated circles dengan ukuran dan posisi berbeda - SEMUA POINTER-EVENTS-NONE */}
                <div className={`absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-2xl ${pattern.circles[0]} pointer-events-none`}></div>
                <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-300/40 to-indigo-300/40 rounded-full blur-2xl ${pattern.circles[1]} pointer-events-none`} style={{ animationDelay: '0.3s' }}></div>
                <div className={`absolute top-1/4 right-1/3 w-20 h-20 bg-gradient-to-br from-green-300/30 to-emerald-300/30 rounded-full blur-xl ${pattern.circles[2]} pointer-events-none`} style={{ animationDelay: '0.6s' }}></div>
                <div className={`absolute bottom-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-xl ${pattern.circles[3]} pointer-events-none`} style={{ animationDelay: '0.9s' }}></div>
                <div className={`absolute top-1/2 left-1/2 w-12 h-12 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full blur-lg animate-pulse pointer-events-none`} style={{ animationDelay: '1.2s' }}></div>
                
                {/* 6 sparkles dengan warna dan ukuran berbeda - SEMUA POINTER-EVENTS-NONE */}
                <div className="absolute top-4 right-6 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg pointer-events-none"></div>
                <div className="absolute top-8 right-10 w-1 h-1 bg-pink-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-10 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute top-12 left-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
                <div className="absolute top-1/2 right-4 w-1 h-1 bg-orange-400 rounded-full animate-pulse shadow-lg pointer-events-none" style={{ animationDelay: '1s' }}></div>
                {/* Edit/Delete Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => handleEditWallet(wallet)}
                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                {/* Icon dengan multiple effects */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl relative z-10 hover:scale-125 hover:rotate-12 transition-all duration-300 group-hover:shadow-2xl"
                  style={{ backgroundColor: `${color}30` }}
                >
                  {/* Glow effect behind icon */}
                  <div className="absolute inset-0 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" style={{ backgroundColor: `${color}40` }}></div>
                  <Icon className="w-7 h-7 animate-pulse relative z-10" style={{ color: color }} />
                </div>

                {/* Wallet Name */}
                <h3 className="font-black text-slate-900 mb-1 text-lg relative z-10">
                  {wallet.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-semibold relative z-10">
                  **** {wallet.id.slice(-4)}
                </p>

                {/* Balance */}
                <div className="relative z-10">
                  <p className="text-xs text-slate-600 uppercase font-bold mb-1">{text.balance}</p>
                  <p className="text-xl font-black text-slate-900">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {wallets.length === 0 && (
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-12 text-center border-2 border-purple-200 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10">
            <Wallet className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-bounce-slow" />
            <p className="text-slate-400 mb-4 font-semibold">{text.noWallets}</p>
            <button
              onClick={handleAddWallet}
              type="button"
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              {text.addFirstWallet}
            </button>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showModal && (
        <WalletModal
          wallet={editingWallet}
          onClose={() => {
            setShowModal(false);
            setEditingWallet(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingWallet(null);
            fetchWallets();
          }}
        />
      )}
    </div>
  );
}
