'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Calendar, Tag, TrendingUp, TrendingDown, UtensilsCrossed, ShoppingBag, Home, Zap, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import TransactionModal from './TransactionModal';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCurrency } from '@/lib/currency';

// Translations
const translations = {
  id: {
    title: 'Transaksi',
    subtitle: 'Kelola pengeluaran dan pemasukan harian Anda',
    addTransaction: 'Tambah Transaksi',
    searchPlaceholder: 'Cari transaksi...',
    thisMonth: 'Bulan Ini',
    category: 'Kategori',
    newest: 'Terbaru',
    oldest: 'Terlama',
    highest: 'Tertinggi',
    lowest: 'Terendah',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    noTransactions: 'Tidak ada transaksi yang ditemukan',
    noTransactionsYet: 'Belum ada transaksi',
    startTracking: 'Mulai catat transaksi Anda untuk tracking keuangan yang lebih baik',
    addFirstTransaction: 'Tambah Transaksi Pertama',
    loading: 'Memuat...',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus transaksi ini?',
  },
  en: {
    title: 'Transactions',
    subtitle: 'Manage your daily income and expenses',
    addTransaction: 'Add Transaction',
    searchPlaceholder: 'Search transactions...',
    thisMonth: 'This Month',
    category: 'Category',
    newest: 'Newest',
    oldest: 'Oldest',
    highest: 'Highest',
    lowest: 'Lowest',
    today: 'Today',
    yesterday: 'Yesterday',
    noTransactions: 'No transactions found',
    noTransactionsYet: 'No transactions yet',
    startTracking: 'Start recording your transactions for better financial tracking',
    addFirstTransaction: 'Add First Transaction',
    loading: 'Loading...',
    deleteConfirm: 'Are you sure you want to delete this transaction?',
  }
};

export default function TransactionsClient({ userId }) {
  const searchParams = useSearchParams();
  const { language, currency } = usePreferences();
  const t = (key) => translations[language]?.[key] || translations['id'][key] || key;
  
  // Local currency formatter using user preference
  const formatCurrencyLocal = (amount) => {
    return formatCurrency(amount, currency);
  };
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSort, setFilterSort] = useState('newest');
  const [categories, setCategories] = useState([]);
  
  // Get search query from URL parameter
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };



  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('makan') || name.includes('makanan')) return UtensilsCrossed;
    if (name.includes('gaji') || name.includes('pendapatan')) return Banknote;
    if (name.includes('belanja')) return ShoppingBag;
    if (name.includes('listrik') || name.includes('air') || name.includes('tagihan')) return Zap;
    if (name.includes('rumah') || name.includes('sewa')) return Home;
    return Tag;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = (
      transaction.category.name.toLowerCase().includes(searchLower) ||
      transaction.note?.toLowerCase().includes(searchLower) ||
      transaction.wallet.name.toLowerCase().includes(searchLower)
    );

    // Filter by month
    let matchMonth = true;
    if (filterMonth !== 'all') {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      
      if (filterMonth === 'current') {
        // Current month
        matchMonth = transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
      } else {
        // Specific month format: "2026-07"
        const [year, month] = filterMonth.split('-');
        matchMonth = transactionDate.getMonth() === parseInt(month) - 1 && 
                     transactionDate.getFullYear() === parseInt(year);
      }
    }

    // Filter by category
    const matchCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;

    return matchSearch && matchMonth && matchCategory;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (filterSort === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (filterSort === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (filterSort === 'highest') {
      return Number(b.amount) - Number(a.amount);
    } else if (filterSort === 'lowest') {
      return Number(a.amount) - Number(b.amount);
    }
    return 0;
  });

  // Group by date
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Calculate daily totals
  const getDailyTotal = (transactions) => {
    return transactions.reduce((sum, t) => {
      if (t.type === 'expense') {
        return sum - Number(t.amount);
      } else {
        return sum + Number(t.amount);
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('addTransaction')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Animated decorative circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        
        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-500" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* Month Filter Dropdown */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-5 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border border-slate-200 flex items-center gap-2"
            >
              <option value="all">Semua Bulan</option>
              <option value="current">{t('thisMonth')}</option>
              {(() => {
                const months = [];
                const now = new Date();
                // Generate last 12 months
                for (let i = 0; i < 12; i++) {
                  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const label = format(date, 'MMMM yyyy', { locale: id });
                  months.push(
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                }
                return months;
              })()}
            </select>

            {/* Category Filter Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-5 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border border-slate-200 flex items-center gap-2"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              className="px-5 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border border-slate-200"
            >
              <option value="newest">{t('newest')}</option>
              <option value="oldest">{t('oldest')}</option>
              <option value="highest">{t('highest')}</option>
              <option value="lowest">{t('lowest')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map(date => {
            const dayTransactions = groupedTransactions[date];
            const dailyTotal = getDailyTotal(dayTransactions);
            const dateObj = new Date(date);
            
            return (
              <div key={date} className="space-y-3">
                {/* Date Header with Daily Total */}
                <div className="flex items-center justify-between px-2 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {(() => {
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      const transactionDate = format(dateObj, 'yyyy-MM-dd');
                      const todayDate = format(today, 'yyyy-MM-dd');
                      const yesterdayDate = format(yesterday, 'yyyy-MM-dd');
                      
                      if (transactionDate === todayDate) {
                        return t('today');
                      } else if (transactionDate === yesterdayDate) {
                        return t('yesterday');
                      } else {
                        return format(dateObj, 'EEEE', { locale: id });
                      }
                    })()}
                    <span className="text-sm font-semibold text-slate-500 ml-2">
                      — {format(dateObj, 'dd MMM yyyy', { locale: id })}
                    </span>
                  </h3>
                  <span className={`text-lg font-black px-4 py-2 rounded-xl shadow-md ${
                    dailyTotal < 0 
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-200' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border border-green-200'
                  }`}>
                    {dailyTotal < 0 ? '-' : '+'} {formatCurrencyLocal(Math.abs(dailyTotal))}
                  </span>
                </div>

                {/* Transaction Cards */}
                <div className="space-y-3">
                  {dayTransactions.map(transaction => {
                    const Icon = getCategoryIcon(transaction.category.name);
                    const isExpense = transaction.type === 'expense';
                    
                    return (
                      <div
                        key={transaction.id}
                        className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-5 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] relative overflow-hidden group"
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setShowModal(true);
                        }}
                      >
                        {/* Decorative gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="flex items-center justify-between relative z-10">
                          {/* Left: Icon + Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                              isExpense 
                                ? 'bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-200' 
                                : 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200'
                            }`}>
                              <Icon className={`w-7 h-7 ${
                                isExpense ? 'text-red-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-slate-900 text-base mb-1">
                                {transaction.note || transaction.category.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 rounded-lg uppercase shadow-sm border border-slate-300">
                                  {transaction.category.name}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold">
                                  • {transaction.wallet.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount + Time */}
                          <div className="text-right">
                            <p className={`text-xl font-black mb-1 ${
                              isExpense ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isExpense ? '- ' : '+ '}{formatCurrencyLocal(transaction.amount)}
                            </p>
                            <p className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-lg inline-block shadow-sm">
                              {format(new Date(transaction.date), 'HH:mm', { locale: id })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-12 text-center border-2 border-slate-200 shadow-lg relative overflow-hidden">
            {/* Animated decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow border-2 border-slate-300">
                <TrendingUp className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-400 mb-2 font-bold text-lg">
                {searchTerm ? t('noTransactions') : t('noTransactionsYet')}
              </p>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                {t('startTracking')}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('addFirstTransaction')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingTransaction(null);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
