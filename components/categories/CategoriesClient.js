'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, UtensilsCrossed, Car, ShoppingBag, Home, Zap, Heart, BookOpen, Gamepad2, TrendingUp, Wallet } from 'lucide-react';
import CategoryModal from './CategoryModal';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCurrency } from '@/lib/currency';

// Translations
const translations = {
  id: {
    title: 'Atur Pengeluaranmu',
    subtitle: 'Kelola kategori untuk pelacakan yang lebih detail',
    addCategory: 'Tambah Kategori',
    totalCategories: 'Total Kategori',
    expense: 'Pengeluaran',
    income: 'Pemasukan',
    active: 'Aktif',
    thisMonth: 'Bulan Ini',
    mostSpent: 'Terboros Bulan Ini',
    mostEarned: 'Terbanyak Bulan Ini',
    searchPlaceholder: 'Cari kategori...',
    transactions: 'Transaksi',
    totalThisMonth: 'Total Bulan Ini',
    noCategories: 'Tidak ada kategori yang ditemukan',
    noCategoriesYet: 'Belum ada kategori',
    createToOrganize: 'Buat kategori untuk mengorganisir transaksi Anda',
    addFirstCategory: 'Tambah Kategori Pertama',
    loading: 'Memuat...',
    deleteDefaultAlert: 'Kategori default tidak bisa dihapus',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus kategori ini?',
  },
  en: {
    title: 'Manage Your Expenses',
    subtitle: 'Manage categories for more detailed tracking',
    addCategory: 'Add Category',
    totalCategories: 'Total Categories',
    expense: 'Expenses',
    income: 'Income',
    active: 'Active',
    thisMonth: 'This Month',
    mostSpent: 'Most Spent This Month',
    mostEarned: 'Most Earned This Month',
    searchPlaceholder: 'Search categories...',
    transactions: 'Transactions',
    totalThisMonth: 'Total This Month',
    noCategories: 'No categories found',
    noCategoriesYet: 'No categories yet',
    createToOrganize: 'Create categories to organize your transactions',
    addFirstCategory: 'Add First Category',
    loading: 'Loading...',
    deleteDefaultAlert: 'Default categories cannot be deleted',
    deleteConfirm: 'Are you sure you want to delete this category?',
  }
};

export default function CategoriesClient({ userId }) {
  const { language, currency } = usePreferences();
  const t = (key) => translations[language]?.[key] || translations['id'][key] || key;
  
  // Local currency formatter using user preference
  const formatCurrencyLocal = (amount) => {
    return formatCurrency(amount, currency);
  };
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' or 'income'

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      
      // Fetch transaction stats for each category
      await fetchCategoryStats(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async (categoriesList) => {
    try {
      const response = await fetch('/api/transactions');
      const transactions = await response.json();
      
      // Get current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const stats = {};
      categoriesList.forEach(category => {
        const categoryTransactions = transactions.filter(t => 
          t.categoryId === category.id &&
          new Date(t.date) >= firstDayOfMonth &&
          new Date(t.date) <= lastDayOfMonth
        );
        
        stats[category.id] = {
          count: categoryTransactions.length,
          total: categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
        };
      });
      
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      alert(t('deleteDefaultAlert'));
      return;
    }

    if (!confirm(t('deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('makan') || name.includes('makanan')) return UtensilsCrossed;
    if (name.includes('transport')) return Car;
    if (name.includes('belanja')) return ShoppingBag;
    if (name.includes('hiburan')) return Gamepad2;
    if (name.includes('pendidikan')) return BookOpen;
    if (name.includes('kesehatan')) return Heart;
    if (name.includes('listrik') || name.includes('tagihan')) return Zap;
    if (name.includes('rumah') || name.includes('sewa')) return Home;
    if (name.includes('gaji') || name.includes('pendapatan')) return Wallet;
    return TrendingUp;
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = category.name.toLowerCase().includes(searchLower);
    const matchesType = category.type === activeTab;
    return matchesSearch && matchesType;
  });

  // Get top spending category this month (only for expenses)
  const topCategory = categories
    .filter(c => c.type === 'expense')
    .sort((a, b) => {
      const aTotal = categoryStats[a.id]?.total || 0;
      const bTotal = categoryStats[b.id]?.total || 0;
      return bTotal - aTotal;
    })[0];

  // Count active categories (with transactions this month) for current tab
  const activeCategories = filteredCategories.filter(c => 
    (categoryStats[c.id]?.count || 0) > 0
  ).length;

  // Count categories added this month for current tab
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newCategoriesThisMonth = categories.filter(c => 
    new Date(c.createdAt) >= firstDayOfMonth && c.type === activeTab
  ).length;

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
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('addCategory')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Categories Card */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-25 animate-bounce-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className={`w-14 h-14 ${
              activeTab === 'expense' 
                ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            } rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}>
              <TrendingUp className="w-7 h-7 text-white animate-pulse" />
            </div>
            {newCategoriesThisMonth > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-full shadow-md animate-bounce">
                +{newCategoriesThisMonth} {t('thisMonth')}
              </span>
            )}
          </div>
          <p className="text-slate-700 text-sm font-semibold mb-1 uppercase tracking-wide relative z-10">
            {t('totalCategories')} {activeTab === 'expense' ? t('expense') : t('income')}
          </p>
          <h3 className="text-5xl font-black text-slate-900 relative z-10 drop-shadow-sm">
            {filteredCategories.length}
            <span className="text-lg text-slate-500 ml-2 font-semibold">{t('active')}</span>
          </h3>
        </div>

        {/* Top Category Card - Only show for expenses */}
        {activeTab === 'expense' && topCategory && (
          <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-3xl p-6 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
            {/* Animated decorative circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-red-300 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full opacity-25 animate-bounce-slow"></div>
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Sparkle effects */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">{t('mostSpent')}</p>
                  <h3 className="text-2xl font-black text-slate-900 drop-shadow-sm">{topCategory.name}</h3>
                </div>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-4xl font-black text-red-600 drop-shadow-sm">
                {formatCurrencyLocal(categoryStats[topCategory.id]?.total || 0)}
              </p>
            </div>
          </div>
        )}

        {/* Top Income Category - Only show for income */}
        {activeTab === 'income' && (() => {
          const topIncome = categories
            .filter(c => c.type === 'income')
            .sort((a, b) => {
              const aTotal = categoryStats[a.id]?.total || 0;
              const bTotal = categoryStats[b.id]?.total || 0;
              return bTotal - aTotal;
            })[0];
          
          return topIncome && (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              {/* Animated decorative circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-25 animate-bounce-slow"></div>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-teal-300 to-green-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Sparkle effects */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <Wallet className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">{t('mostEarned')}</p>
                    <h3 className="text-2xl font-black text-slate-900 drop-shadow-sm">{topIncome.name}</h3>
                  </div>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-4xl font-black text-green-600 drop-shadow-sm">
                  {formatCurrencyLocal(categoryStats[topIncome.id]?.total || 0)}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-8 py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
            activeTab === 'expense'
              ? 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-white to-red-50 text-slate-700 border-2 border-red-200 hover:border-red-300'
          }`}
        >
          {t('expense')}
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-8 py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
            activeTab === 'income'
              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white'
              : 'bg-gradient-to-r from-white to-green-50 text-slate-700 border-2 border-green-200 hover:border-green-300'
          }`}
        >
          {t('income')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-500 group-focus-within:text-indigo-600 transition-colors z-10" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="w-full pl-14 pr-4 py-4 bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm font-medium shadow-lg hover:shadow-xl transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const stats = categoryStats[category.id] || { count: 0, total: 0 };
          const iconColors = {
            orange: { 
              bg: 'bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100', 
              text: 'text-orange-600', 
              bar: '#FB923C',
              border: 'border-orange-200',
              cardBg: 'from-orange-50/80 via-amber-50/60 to-yellow-50/80',
              glow: 'from-orange-300 to-amber-400'
            },
            blue: { 
              bg: 'bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100', 
              text: 'text-blue-600', 
              bar: '#3B82F6',
              border: 'border-blue-200',
              cardBg: 'from-blue-50/80 via-cyan-50/60 to-sky-50/80',
              glow: 'from-blue-300 to-cyan-400'
            },
            purple: { 
              bg: 'bg-gradient-to-br from-purple-100 via-purple-50 to-fuchsia-100', 
              text: 'text-purple-600', 
              bar: '#A855F7',
              border: 'border-purple-200',
              cardBg: 'from-purple-50/80 via-fuchsia-50/60 to-pink-50/80',
              glow: 'from-purple-300 to-fuchsia-400'
            },
            green: { 
              bg: 'bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100', 
              text: 'text-emerald-600', 
              bar: '#10B981',
              border: 'border-emerald-200',
              cardBg: 'from-emerald-50/80 via-teal-50/60 to-green-50/80',
              glow: 'from-emerald-300 to-teal-400'
            },
            indigo: { 
              bg: 'bg-gradient-to-br from-indigo-100 via-indigo-50 to-violet-100', 
              text: 'text-indigo-600', 
              bar: '#6366F1',
              border: 'border-indigo-200',
              cardBg: 'from-indigo-50/80 via-violet-50/60 to-purple-50/80',
              glow: 'from-indigo-300 to-violet-400'
            },
            pink: { 
              bg: 'bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100', 
              text: 'text-pink-600', 
              bar: '#EC4899',
              border: 'border-pink-200',
              cardBg: 'from-pink-50/80 via-rose-50/60 to-red-50/80',
              glow: 'from-pink-300 to-rose-400'
            },
            red: { 
              bg: 'bg-gradient-to-br from-red-100 via-red-50 to-orange-100', 
              text: 'text-red-600', 
              bar: '#EF4444',
              border: 'border-red-200',
              cardBg: 'from-red-50/80 via-rose-50/60 to-pink-50/80',
              glow: 'from-red-300 to-rose-400'
            },
          };
          
          // Assign color based on category name
          let colorScheme = iconColors.blue;
          const name = category.name.toLowerCase();
          if (name.includes('makan')) colorScheme = iconColors.orange;
          else if (name.includes('transport') || name.includes('bensin')) colorScheme = iconColors.blue;
          else if (name.includes('belanja')) colorScheme = iconColors.purple;
          else if (name.includes('hiburan')) colorScheme = iconColors.green;
          else if (name.includes('pendidikan')) colorScheme = iconColors.indigo;
          else if (name.includes('kesehatan')) colorScheme = iconColors.red;
          else if (name.includes('gaji')) colorScheme = iconColors.green;

          return (
            <div
              key={category.id}
              className={`bg-gradient-to-br ${colorScheme.cardBg} rounded-3xl p-6 border-2 ${colorScheme.border} hover:shadow-2xl transition-all duration-300 relative group overflow-hidden hover:scale-[1.03] cursor-pointer`}
            >
              {/* Animated decorative circles */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-20 animate-pulse`}></div>
              <div className={`absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-15 animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
              
              {/* Sparkle effects */}
              <div className={`absolute top-3 left-3 w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar }}></div>
              <div className={`absolute bottom-8 right-8 w-1 h-1 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: '0.3s' }}></div>
              
              {/* Edit/Delete Buttons - Show on Hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(category);
                    setShowModal(true);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all"
                >
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id, category.isDefault);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Icon */}
              <div className={`relative z-10 w-16 h-16 ${colorScheme.bg} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 ${colorScheme.border}`}
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
              >
                <Icon className={`w-8 h-8 ${colorScheme.text} group-hover:animate-pulse`} />
              </div>

              {/* Category Name */}
              <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-1 drop-shadow-sm"
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
              >{category.name}</h3>
              <p className="relative z-10 text-sm text-slate-600 mb-5 font-semibold"
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
              >{stats.count} {t('transactions')}</p>

              {/* Total Amount */}
              <div className="relative z-10 mb-4"
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
              >
                <p className="text-xs text-slate-600 uppercase mb-2 font-bold tracking-wide">{t('totalThisMonth')}</p>
                <p className="text-3xl font-black text-slate-900 drop-shadow-sm">
                  {formatCurrencyLocal(stats.total)}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 w-full h-3 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-slate-200"
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-md relative overflow-hidden"
                  style={{ 
                    width: stats.count > 0 ? `${Math.min((stats.count / 24) * 100, 100)}%` : '0%',
                    backgroundColor: colorScheme.bar
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 rounded-3xl p-12 text-center border-2 border-indigo-200 shadow-xl relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-6 left-6 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-12 right-16 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow border-2 border-indigo-300">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="text-slate-400 mb-2 font-bold text-lg">
              {searchTerm ? t('noCategories') : t('noCategoriesYet')}
            </p>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {t('createToOrganize')}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('addFirstCategory')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingCategory(null);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
