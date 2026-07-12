'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, UtensilsCrossed, Car, ShoppingBag, TrendingDown, ChevronRight, Edit, Trash2, PiggyBank } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import BudgetModal from './BudgetModal';
import SavingGoalModal from './SavingGoalModal';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCurrency } from '@/lib/currency';

// Translations
const translations = {
  id: {
    yourFinancials: 'FINANSIAL ANDA',
    budgetAndGoals: 'Anggaran & Target',
    totalBudget: 'Total Anggaran',
    used: 'Terpakai',
    remaining: 'Sisa',
    spendingUp: 'Pengeluaran naik',
    spendingDown: 'Pengeluaran turun',
    compareTo: 'dibanding bulan lalu',
    firstMonth: 'Bulan pertama pencatatan anggaran',
    sameToPrevious: 'Pengeluaran sama dengan bulan lalu',
    budgetCategories: 'Anggaran Kategori',
    createNewBudget: 'Buat Anggaran Baru',
    exceeded: 'TERLAMPAU!',
    almostOut: 'HAMPIR HABIS',
    safe: 'AMAN',
    plenty: 'MASIH BANYAK',
    leftOver: 'Sisa',
    noBudgetsThisMonth: 'Belum ada anggaran bulan ini',
    createBudgetControl: 'Buat anggaran untuk mengontrol pengeluaran Anda',
    addFirstBudget: 'Tambah Anggaran Pertama',
    savingGoals: 'Target Tabungan',
    createNewGoal: 'Buat Target Baru',
    loading: 'Memuat...',
    deleteBudgetConfirm: 'Apakah Anda yakin ingin menghapus anggaran ini?',
    deleteGoalConfirm: 'Apakah Anda yakin ingin menghapus target tabungan ini?',
    noGoalsYet: 'Belum ada target tabungan',
    createGoalToSave: 'Buat target untuk mencapai tujuan finansial Anda',
    addFirstGoal: 'Buat Target Pertama',
    saved: 'Terkumpul',
    of: 'dari',
    daysLeft: 'Hari Lagi',
    achieved: 'Tercapai',
    addSavings: 'Tambah Tabungan',
    uploadImage: 'Upload Gambar',
    target: 'Target',
    targetTotal: 'Target Total',
    monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  },
  en: {
    yourFinancials: 'YOUR FINANCIALS',
    budgetAndGoals: 'Budget & Goals',
    totalBudget: 'Total Budget',
    used: 'Used',
    remaining: 'Remaining',
    spendingUp: 'Spending up',
    spendingDown: 'Spending down',
    compareTo: 'compared to last month',
    firstMonth: 'First month tracking budget',
    sameToPrevious: 'Spending same as last month',
    budgetCategories: 'Budget Categories',
    createNewBudget: 'Create New Budget',
    exceeded: 'EXCEEDED!',
    almostOut: 'ALMOST OUT',
    safe: 'SAFE',
    plenty: 'PLENTY LEFT',
    leftOver: 'Left',
    noBudgetsThisMonth: 'No budgets this month',
    createBudgetControl: 'Create a budget to control your spending',
    addFirstBudget: 'Add First Budget',
    savingGoals: 'Saving Goals',
    createNewGoal: 'Create New Goal',
    loading: 'Loading...',
    deleteBudgetConfirm: 'Are you sure you want to delete this budget?',
    deleteGoalConfirm: 'Are you sure you want to delete this saving goal?',
    noGoalsYet: 'No saving goals yet',
    createGoalToSave: 'Create a goal to achieve your financial objectives',
    addFirstGoal: 'Create First Goal',
    saved: 'Saved',
    of: 'of',
    daysLeft: 'Days Left',
    achieved: 'Achieved',
    addSavings: 'Add Savings',
    uploadImage: 'Upload Image',
    target: 'Target',
    targetTotal: 'Target Total',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  }
};

export default function BudgetClient({ userId }) {
  const { language, currency } = usePreferences();
  const t = (key) => translations[language]?.[key] || translations['id'][key] || key;
  
  // Local currency formatter using user preference
  const formatCurrencyLocal = (amount) => {
    return formatCurrency(amount, currency);
  };
  
  const monthNames = t('monthNames');
  const [budgets, setBudgets] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsRes, categoriesRes, transactionsRes, goalsRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/categories'),
        fetch('/api/transactions'),
        fetch('/api/saving-goals'),
      ]);

      const budgetsData = await budgetsRes.json();
      const categoriesData = await categoriesRes.json();
      const transactionsData = await transactionsRes.json();
      const goalsData = await goalsRes.json();

      setBudgets(budgetsData);
      setCategories(categoriesData.filter(c => c.type === 'expense'));
      setTransactions(transactionsData);
      setSavingGoals(goalsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm(t('deleteBudgetConfirm'))) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm(t('deleteGoalConfirm'))) return;

    try {
      const response = await fetch(`/api/saving-goals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting saving goal:', error);
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('makan')) return UtensilsCrossed;
    if (name.includes('transport')) return Car;
    if (name.includes('belanja')) return ShoppingBag;
    return TrendingDown;
  };

  // Calculate spending for each budget
  const getBudgetWithSpending = (budget) => {
    const spending = transactions
      .filter(t => 
        t.categoryId === budget.categoryId &&
        t.type === 'expense' &&
        new Date(t.date).getMonth() + 1 === budget.month &&
        new Date(t.date).getFullYear() === budget.year
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const percentage = budget.amount > 0 ? (spending / Number(budget.amount)) * 100 : 0;
    const remaining = Number(budget.amount) - spending;

    return {
      ...budget,
      spending,
      percentage: Math.min(percentage, 100),
      remaining,
      amount: Number(budget.amount),
    };
  };

  const budgetsWithSpending = budgets
    .filter(b => b.month === (selectedMonth + 1) && b.year === selectedYear)
    .map(getBudgetWithSpending);

  const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0);
  const totalSpending = budgetsWithSpending.reduce((sum, b) => sum + b.spending, 0);
  const totalRemaining = totalBudget - totalSpending;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpending / totalBudget) * 100) : 0;

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
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 uppercase font-semibold mb-1">{t('yourFinancials')}</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('budgetAndGoals')}</h1>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMonth === (currentMonth - 2 + 12) % 12
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            {monthNames[(selectedMonth === 0 ? 11 : selectedMonth - 1)]}
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#6366F1] text-white transition-all">
            {monthNames[selectedMonth]} {selectedYear}
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMonth === (currentMonth % 12)
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            {monthNames[(selectedMonth === 11 ? 0 : selectedMonth + 1)]}
          </button>
          <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Budget Card with Circular Progress */}
      <div className="bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
        {/* Animated decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full animate-bounce-slow"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-8 left-8 w-2 h-2 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-12 right-32 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-20 right-12 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Total Budget Info */}
          <div className="lg:col-span-2">
            <p className="text-white/80 text-sm mb-2">{t('totalBudget')} {monthNames[selectedMonth]}</p>
            <h2 className="text-5xl font-black mb-8 drop-shadow-lg animate-fade-in">
              {formatCurrencyLocal(totalBudget)}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.05] hover:shadow-lg">
                <p className="text-white/70 text-xs mb-1 font-medium">{t('used')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrencyLocal(totalSpending)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.05] hover:shadow-lg">
                <p className="text-white/70 text-xs mb-1 font-medium">{t('remaining')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrencyLocal(totalRemaining)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-white/80 text-sm bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
              <TrendingDown className="w-4 h-4 animate-bounce" />
              <span>
                {(() => {
                  // Calculate previous month spending
                  const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
                  const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
                  
                  const prevMonthTrans = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= prevMonthStart && tDate <= prevMonthEnd && t.type === 'expense';
                  });
                  
                  const prevMonthSpending = prevMonthTrans.reduce((sum, t) => sum + Number(t.amount), 0);
                  
                  if (prevMonthSpending === 0) {
                    return t('firstMonth');
                  }
                  
                  const changePercent = ((totalSpending - prevMonthSpending) / prevMonthSpending * 100).toFixed(0);
                  
                  if (changePercent > 0) {
                    return `${t('spendingUp')} ${changePercent}% ${t('compareTo')}`;
                  } else if (changePercent < 0) {
                    return `${t('spendingDown')} ${Math.abs(changePercent)}% ${t('compareTo')}`;
                  } else {
                    return t('sameToPrevious');
                  }
                })()}
              </span>
            </div>
          </div>

          {/* Right: Circular Progress */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-48 h-48 hover:scale-110 transition-transform duration-500">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
              
              {/* SVG Circle Progress */}
              <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#10B981"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(overallPercentage / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 drop-shadow-lg"
                />
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black animate-pulse">{overallPercentage}%</p>
                <p className="text-sm text-white/70 font-semibold uppercase tracking-wider">{t('used')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900">{t('budgetCategories')}</h2>
        <button 
          onClick={() => {
            setEditingBudget(null);
            setShowBudgetModal(true);
          }}
          className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('createNewBudget')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgetsWithSpending.map((budget, index) => {
          const Icon = getCategoryIcon(budget.category.name);
          
          // Variasi warna yang berbeda untuk setiap kartu
          const colorVariations = [
            { 
              cardBg: 'from-orange-50 via-amber-50 to-yellow-50',
              iconBg: 'from-orange-400 to-amber-500',
              text: 'text-orange-600',
              border: 'border-orange-200',
              bar: '#FB923C',
              glow: 'from-orange-300 to-amber-400',
              badge: 'bg-orange-100'
            },
            { 
              cardBg: 'from-blue-50 via-cyan-50 to-sky-50',
              iconBg: 'from-blue-400 to-cyan-500',
              text: 'text-blue-600',
              border: 'border-blue-200',
              bar: '#3B82F6',
              glow: 'from-blue-300 to-cyan-400',
              badge: 'bg-blue-100'
            },
            { 
              cardBg: 'from-pink-50 via-rose-50 to-red-50',
              iconBg: 'from-pink-400 to-rose-500',
              text: 'text-pink-600',
              border: 'border-pink-200',
              bar: '#EC4899',
              glow: 'from-pink-300 to-rose-400',
              badge: 'bg-pink-100'
            },
            { 
              cardBg: 'from-purple-50 via-fuchsia-50 to-pink-50',
              iconBg: 'from-purple-400 to-fuchsia-500',
              text: 'text-purple-600',
              border: 'border-purple-200',
              bar: '#A855F7',
              glow: 'from-purple-300 to-fuchsia-400',
              badge: 'bg-purple-100'
            },
            { 
              cardBg: 'from-green-50 via-emerald-50 to-teal-50',
              iconBg: 'from-green-400 to-emerald-500',
              text: 'text-green-600',
              border: 'border-green-200',
              bar: '#10B981',
              glow: 'from-green-300 to-emerald-400',
              badge: 'bg-green-100'
            },
            { 
              cardBg: 'from-indigo-50 via-violet-50 to-purple-50',
              iconBg: 'from-indigo-400 to-violet-500',
              text: 'text-indigo-600',
              border: 'border-indigo-200',
              bar: '#6366F1',
              glow: 'from-indigo-300 to-violet-400',
              badge: 'bg-indigo-100'
            },
          ];
          
          const colorScheme = colorVariations[index % colorVariations.length];
          
          // Variasi animasi yang berbeda untuk setiap kartu
          const animations = [
            { circle1: 'animate-pulse', circle2: 'animate-bounce-slow', circle3: 'animate-spin-slow' },
            { circle1: 'animate-bounce-slow', circle2: 'animate-pulse', circle3: 'animate-pulse' },
            { circle1: 'animate-spin-slow', circle2: 'animate-pulse', circle3: 'animate-bounce-slow' },
            { circle1: 'animate-pulse', circle2: 'animate-spin-slow', circle3: 'animate-pulse' },
            { circle1: 'animate-bounce-slow', circle2: 'animate-pulse', circle3: 'animate-spin-slow' },
            { circle1: 'animate-pulse', circle2: 'animate-bounce-slow', circle3: 'animate-pulse' },
          ];
          
          const animation = animations[index % animations.length];

          const statusBadge = budget.percentage >= 100 
            ? { text: t('exceeded'), color: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' }
            : budget.percentage >= 90 
            ? { text: t('almostOut'), color: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg' }
            : budget.percentage >= 50
            ? { text: t('safe'), color: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg' }
            : { text: t('plenty'), color: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg' };

          return (
            <div
              key={budget.id}
              className={`bg-gradient-to-br ${colorScheme.cardBg} rounded-3xl p-6 border-2 ${colorScheme.border} hover:shadow-2xl transition-all duration-300 relative group overflow-hidden hover:scale-[1.03]`}
            >
              {/* Animated decorative circles dengan animasi berbeda */}
              <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-20 ${animation.circle1}`}></div>
              <div className={`absolute top-12 -right-4 w-16 h-16 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-25 ${animation.circle2}`} style={{ animationDelay: '0.3s' }}></div>
              <div className={`absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-15 ${animation.circle3}`} style={{ animationDelay: '0.6s' }}></div>
              
              {/* Sparkle effects dengan posisi berbeda */}
              <div className={`absolute ${index % 2 === 0 ? 'top-4 left-4' : 'top-6 right-6'} w-2 h-2 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar }}></div>
              <div className={`absolute ${index % 2 === 0 ? 'bottom-10 right-12' : 'bottom-8 left-8'} w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: '0.4s' }}></div>
              <div className={`absolute ${index % 3 === 0 ? 'top-20 left-16' : 'top-16 right-20'} w-1 h-1 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: '0.7s' }}></div>
              
              {/* Edit/Delete Buttons - Show on Hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBudget(budget);
                    setShowBudgetModal(true);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all"
                >
                  <Edit className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBudget(budget.id);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
              
              {/* Header with Icon and Badge */}
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${colorScheme.iconBg} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-2 border-white/50`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className={`text-xs font-black px-4 py-2 rounded-full ${statusBadge.color} animate-pulse`}>
                  {statusBadge.text}
                </span>
              </div>

              {/* Category Name */}
              <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-2 drop-shadow-sm">{budget.category.name}</h3>
              <p className={`relative z-10 text-sm font-bold mb-5 ${colorScheme.text}`}>
                {t('leftOver')} {formatCurrencyLocal(budget.remaining > 0 ? budget.remaining : 0)}
              </p>

              {/* Amount Progress */}
              <p className="relative z-10 text-xs text-slate-700 font-bold mb-3 flex items-center justify-between">
                <span>{formatCurrencyLocal(budget.spending)}</span>
                <span className="text-slate-400">/</span>
                <span>{formatCurrencyLocal(budget.amount)}</span>
                <span className={`ml-auto text-base font-black ${colorScheme.text}`}>{Math.round(budget.percentage)}%</span>
              </p>

              {/* Progress Bar dengan efek lebih fancy */}
              <div className="relative z-10 w-full h-4 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border-2 border-white/40">
                <div 
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden shadow-lg"
                  style={{ 
                    width: `${Math.min(budget.percentage, 100)}%`,
                    backgroundColor: colorScheme.bar
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 shadow-lg" style={{ boxShadow: `0 0 10px ${colorScheme.bar}` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgetsWithSpending.length === 0 && (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-12 text-center border-2 border-blue-200 shadow-xl relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-15 animate-spin-slow"></div>
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-10 animate-bounce-slow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-12 right-16 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow border-2 border-blue-300">
              <TrendingDown className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-slate-400 mb-2 font-bold text-lg">{t('noBudgetsThisMonth')}</p>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {t('createBudgetControl')}
            </p>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('addFirstBudget')}
            </button>
          </div>
        </div>
      )}

      {/* Saving Goals */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900">{t('savingGoals')}</h2>
        <button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-sm flex items-center gap-2"
          onClick={() => {
            setEditingGoal(null);
            setShowGoalModal(true);
          }}
        >
          <Plus className="w-5 h-5" />
          {t('createNewGoal')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingGoals.length > 0 ? savingGoals.map((goal, index) => {
          const percentage = Math.round((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100);
          
          // Variasi warna yang BERBEDA untuk setiap goal
          const colorVariations = [
            {
              cardBg: 'from-emerald-50 via-teal-50 to-cyan-50',
              imageBg: 'from-emerald-200 via-teal-300 to-cyan-200',
              percentColor: 'text-emerald-600',
              bar: '#10B981',
              glow: 'from-emerald-400 to-teal-500',
              border: 'border-emerald-200',
              iconBg: 'from-emerald-400 to-teal-500'
            },
            {
              cardBg: 'from-violet-50 via-purple-50 to-fuchsia-50',
              imageBg: 'from-violet-200 via-purple-300 to-fuchsia-200',
              percentColor: 'text-violet-600',
              bar: '#8B5CF6',
              glow: 'from-violet-400 to-purple-500',
              border: 'border-violet-200',
              iconBg: 'from-violet-400 to-purple-500'
            },
            {
              cardBg: 'from-amber-50 via-orange-50 to-yellow-50',
              imageBg: 'from-amber-200 via-orange-300 to-yellow-200',
              percentColor: 'text-amber-600',
              bar: '#F59E0B',
              glow: 'from-amber-400 to-orange-500',
              border: 'border-amber-200',
              iconBg: 'from-amber-400 to-orange-500'
            },
            {
              cardBg: 'from-rose-50 via-pink-50 to-red-50',
              imageBg: 'from-rose-200 via-pink-300 to-red-200',
              percentColor: 'text-rose-600',
              bar: '#F43F5E',
              glow: 'from-rose-400 to-pink-500',
              border: 'border-rose-200',
              iconBg: 'from-rose-400 to-pink-500'
            },
            {
              cardBg: 'from-sky-50 via-blue-50 to-indigo-50',
              imageBg: 'from-sky-200 via-blue-300 to-indigo-200',
              percentColor: 'text-sky-600',
              bar: '#0EA5E9',
              glow: 'from-sky-400 to-blue-500',
              border: 'border-sky-200',
              iconBg: 'from-sky-400 to-blue-500'
            },
          ];
          
          const colorScheme = colorVariations[index % colorVariations.length];
          
          // Variasi animasi yang SANGAT BERBEDA untuk setiap goal
          const animations = [
            { 
              circle1: 'animate-spin-slow', 
              circle2: 'animate-bounce-slow', 
              circle3: 'animate-pulse',
              circle4: 'animate-ping',
              sparkle1Delay: '0s',
              sparkle2Delay: '0.3s',
              sparkle3Delay: '0.6s',
              sparkle4Delay: '0.9s'
            },
            { 
              circle1: 'animate-pulse', 
              circle2: 'animate-spin-slow', 
              circle3: 'animate-bounce-slow',
              circle4: 'animate-pulse',
              sparkle1Delay: '0.2s',
              sparkle2Delay: '0.5s',
              sparkle3Delay: '0.8s',
              sparkle4Delay: '0.1s'
            },
            { 
              circle1: 'animate-bounce-slow', 
              circle2: 'animate-pulse', 
              circle3: 'animate-spin-slow',
              circle4: 'animate-bounce-slow',
              sparkle1Delay: '0.4s',
              sparkle2Delay: '0.7s',
              sparkle3Delay: '0.1s',
              sparkle4Delay: '0.5s'
            },
            { 
              circle1: 'animate-pulse', 
              circle2: 'animate-bounce-slow', 
              circle3: 'animate-pulse',
              circle4: 'animate-spin-slow',
              sparkle1Delay: '0.6s',
              sparkle2Delay: '0.2s',
              sparkle3Delay: '0.9s',
              sparkle4Delay: '0.3s'
            },
            { 
              circle1: 'animate-spin-slow', 
              circle2: 'animate-pulse', 
              circle3: 'animate-bounce-slow',
              circle4: 'animate-pulse',
              sparkle1Delay: '0.1s',
              sparkle2Delay: '0.4s',
              sparkle3Delay: '0.7s',
              sparkle4Delay: '0.2s'
            },
          ];
          
          const animation = animations[index % animations.length];
          
          const targetDate = new Date(goal.targetDate);
          const formattedDate = targetDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          
          return (
            <div
              key={goal.id}
              className={`bg-gradient-to-br ${colorScheme.cardBg} rounded-3xl overflow-hidden border-2 ${colorScheme.border} hover:shadow-2xl transition-all duration-300 relative group hover:scale-[1.02]`}
            >
              {/* Animated decorative circles - 4 circles dengan animasi berbeda */}
              <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-15 ${animation.circle1}`}></div>
              <div className={`absolute top-20 -right-8 w-24 h-24 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-20 ${animation.circle2}`} style={{ animationDelay: '0.4s' }}></div>
              <div className={`absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-10 ${animation.circle3}`} style={{ animationDelay: '0.8s' }}></div>
              <div className={`absolute bottom-1/2 left-1/3 w-20 h-20 bg-gradient-to-br ${colorScheme.glow} rounded-full opacity-12 ${animation.circle4}`} style={{ animationDelay: '1.2s' }}></div>
              
              {/* Sparkle effects - 4 sparkles dengan delay berbeda */}
              <div className={`absolute top-6 left-6 w-2 h-2 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: animation.sparkle1Delay }}></div>
              <div className={`absolute top-12 right-12 w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: animation.sparkle2Delay }}></div>
              <div className={`absolute bottom-16 left-16 w-1 h-1 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: animation.sparkle3Delay }}></div>
              <div className={`absolute bottom-8 right-24 w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: colorScheme.bar, animationDelay: animation.sparkle4Delay }}></div>
              
              {/* Edit/Delete Buttons */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGoal(goal);
                    setShowGoalModal(true);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all"
                >
                  <Edit className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGoal(goal.id);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 relative z-10">
                {/* Image Section - Siap untuk gambar user */}
                <div className={`col-span-1 bg-gradient-to-br ${colorScheme.imageBg} flex items-center justify-center text-slate-500 text-sm font-medium p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                  {/* Jika ada gambar, akan ditampilkan disini. Sekarang pakai icon default */}
                  {goal.image ? (
                    <img 
                      src={goal.image} 
                      alt={goal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${colorScheme.iconBg} rounded-3xl flex items-center justify-center shadow-xl mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 border-2 border-white/50`}>
                        <PiggyBank className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">{t('uploadImage')}</p>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="col-span-2 p-6 relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 drop-shadow-sm">{goal.name}</h3>
                      <p className="text-sm text-slate-600 font-semibold">{t('target')}: {formattedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-5xl font-black ${colorScheme.percentColor} drop-shadow-lg animate-pulse`}>
                        {percentage}%
                      </p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{t('achieved')}</p>
                    </div>
                  </div>

                  {/* Progress Bar dengan efek mewah */}
                  <div className="w-full h-4 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden mb-4 shadow-inner border-2 border-white/40">
                    <div 
                      className="h-full rounded-full transition-all duration-500 relative overflow-hidden shadow-lg"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: colorScheme.bar
                      }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                      {/* Moving gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      {/* Glow effect */}
                      <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 10px ${colorScheme.bar}` }}></div>
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="flex items-center justify-between text-xs mb-5">
                    <div className="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-white/40">
                      <p className="text-slate-600 uppercase font-bold mb-1">{t('saved')}</p>
                      <p className="text-slate-900 font-black text-base">
                        {formatCurrencyLocal(Number(goal.savedAmount))}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-white/40">
                      <p className="text-slate-600 uppercase font-bold mb-1">{t('targetTotal')}</p>
                      <p className="text-slate-900 font-black text-base">
                        {formatCurrencyLocal(Number(goal.targetAmount))}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowGoalModal(true);
                    }}
                    className={`w-full py-3 font-black text-sm hover:bg-white/80 rounded-xl transition-all border-2 shadow-lg hover:shadow-xl hover:scale-[1.02] ${colorScheme.border}`}
                    style={{ color: colorScheme.bar }}
                  >
                    {t('addSavings')}
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-2 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 rounded-3xl p-12 text-center border-2 border-indigo-200 shadow-xl relative overflow-hidden">
            {/* Animated decorative circles - variasi berbeda */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-15 animate-spin-slow"></div>
            <div className="absolute top-20 -right-8 w-24 h-24 bg-gradient-to-br from-purple-300 to-fuchsia-400 rounded-full opacity-20 animate-bounce-slow" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-fuchsia-300 to-pink-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full opacity-12 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
            
            {/* Sparkle effects - 4 sparkles */}
            <div className="absolute top-8 left-8 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
            <div className="absolute top-16 right-16 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-20 left-20 w-1 h-1 bg-fuchsia-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute bottom-12 right-24 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce-slow border-2 border-indigo-300">
                <PiggyBank className="w-12 h-12 text-indigo-600" />
              </div>
              <p className="text-slate-400 mb-2 font-bold text-lg">{t('noGoalsYet')}</p>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                {t('createGoalToSave')}
              </p>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setShowGoalModal(true);
                }}
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('addFirstGoal')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <BudgetModal
          budget={editingBudget}
          categories={categories}
          onClose={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
          onSuccess={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
            fetchData();
          }}
        />
      )}

      {/* Saving Goal Modal */}
      {showGoalModal && (
        <SavingGoalModal
          savingGoal={editingGoal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onSuccess={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
