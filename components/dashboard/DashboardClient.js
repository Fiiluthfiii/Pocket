'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  User,
  UtensilsCrossed,
  Banknote,
  ShoppingBag,
  Home as HomeIcon,
  PiggyBank
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCurrency } from '@/lib/currency';
import { useState } from 'react';

// Translations
const translations = {
  id: {
    hello: 'Halo',
    summary: 'Inringkasan keuanganmu untuk bulan',
    search: 'Cari transaksi, laporan...',
    addTransaction: '+ Tambah Transaksi',
    totalBalance: 'TOTAL SALDO',
    totalIncome: 'TOTAL PEMASUKAN',
    totalExpense: 'TOTAL PENGELUARAN',
    cashflow: 'Arus Kas',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transactions: 'Transaksi',
    viewAll: 'Lihat Semua',
    category: 'Kategori',
    dominant: 'Dominan',
    efficient: 'Efisien',
    noCategory: 'Belum ada data kategori',
    budgetTarget: 'Target Anggaran',
    noBudget: 'Belum ada target anggaran',
    createBudget: 'Buat Target Anggaran',
  },
  en: {
    hello: 'Hello',
    summary: 'Your financial summary for',
    search: 'Search transactions, reports...',
    addTransaction: '+ Add Transaction',
    totalBalance: 'TOTAL BALANCE',
    totalIncome: 'TOTAL INCOME',
    totalExpense: 'TOTAL EXPENSES',
    cashflow: 'Cash Flow',
    income: 'Income',
    expense: 'Expenses',
    transactions: 'Transactions',
    viewAll: 'View All',
    category: 'Category',
    dominant: 'Dominant',
    efficient: 'Efficient',
    noCategory: 'No category data yet',
    budgetTarget: 'Budget Target',
    noBudget: 'No budget target yet',
    createBudget: 'Create Budget Target',
  }
};

export default function DashboardClient({ data }) {
  const { language } = usePreferences();
  const t = (key) => translations[language]?.[key] || translations['id'][key] || key;
  
  const { totalBalance, income, expenses, transactions, categoryExpenses, monthlyData } = data;
  
  // Debug log
  console.log('DashboardClient received data:');
  console.log('  Income:', income);
  console.log('  Expenses:', expenses);
  console.log('  Total Balance:', totalBalance);
  
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrencyLocal = (amount) => {
    return formatCurrency(amount);
  };
  
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Redirect to transactions page with search query
      window.location.href = `/dashboard/transactions?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Get icon for transaction category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('makan') || name.includes('makanan')) return UtensilsCrossed;
    if (name.includes('gaji') || name.includes('gali')) return Banknote;
    if (name.includes('belanja')) return ShoppingBag;
    if (name.includes('listrik') || name.includes('air')) return HomeIcon;
    return Wallet;
  };

  // Calculate percentage changes from previous month
  const prevIncome = data.prevMonthIncome || 0;
  const prevExpenses = data.prevMonthExpenses || 0;
  const prevBalance = data.prevMonthBalance || totalBalance;
  
  const balanceChange = prevBalance > 0 
    ? ((totalBalance - prevBalance) / prevBalance * 100).toFixed(1) + '%'
    : '+0%';
  const incomeChange = prevIncome > 0 
    ? ((income - prevIncome) / prevIncome * 100).toFixed(1) + '%'
    : '+0%';
  const expenseChange = prevExpenses > 0 
    ? ((expenses - prevExpenses) / prevExpenses * 100).toFixed(1) + '%'
    : '+0%';

  // Get current month name
  const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  const currentYear = new Date().getFullYear();

  // Use monthlyData for cashflow chart (last 6 months)
  const cashflowData = monthlyData.map(item => ({
    month: item.month,
    Pemasukan: item.income,
    Pengeluaran: item.expense,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {payload[0].payload.month}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Use real budget data
  const budgetData = data.budgets?.map(budget => ({
    name: budget.category?.name || budget.name || 'Anggaran',
    spent: budget.spent || 0,
    budget: budget.amount,
    percentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
    icon: getCategoryIcon(budget.category?.name),
    color: budget.category?.color || '#6366F1',
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {t('hello')}, {data.userName || 'User'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('summary')} {currentMonth}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              className="pl-10 pr-4 py-2.5 w-64 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
            />
          </div>

          {/* Add Transaction Button */}
          <Link 
            href="/dashboard/transactions?action=add"
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
          >
            {t('addTransaction')}
          </Link>

          {/* User Avatar */}
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-25 animate-bounce-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
              <Wallet className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full shadow-md">
              {balanceChange.startsWith('-') ? balanceChange : '+' + balanceChange}
            </span>
          </div>
          <p className="text-slate-700 text-sm font-semibold mb-1 uppercase tracking-wide relative z-10">{t('totalBalance')}</p>
          <h3 className="text-3xl font-black text-slate-900 relative z-10 drop-shadow-sm">
            {formatCurrencyLocal(totalBalance)}
          </h3>
        </div>

        {/* Income */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-25 animate-bounce-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-teal-300 to-green-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
              <TrendingDown className="w-6 h-6 text-white transform rotate-180 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full shadow-md">
              {incomeChange.startsWith('-') ? incomeChange : '+' + incomeChange}
            </span>
          </div>
          <p className="text-slate-700 text-sm font-semibold mb-1 uppercase tracking-wide relative z-10">{t('totalIncome')}</p>
          <h3 className="text-3xl font-black text-slate-900 relative z-10 drop-shadow-sm">
            {formatCurrencyLocal(income)}
          </h3>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-3xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-red-300 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-8 -right-4 w-20 h-20 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full opacity-25 animate-bounce-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white transform rotate-180 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-full shadow-md">
              {expenseChange.startsWith('-') ? expenseChange : '+' + expenseChange}
            </span>
          </div>
          <p className="text-slate-700 text-sm font-semibold mb-1 uppercase tracking-wide relative z-10">{t('totalExpense')}</p>
          <h3 className="text-3xl font-black text-slate-900 relative z-10 drop-shadow-sm">
            {formatCurrencyLocal(expenses)}
          </h3>
        </div>
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-200 to-blue-200 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 drop-shadow-sm">{t('cashflow')}</h2>
              <p className="text-sm text-slate-600 font-medium">{currentYear}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-slate-700 font-semibold">{t('income')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-slate-700 font-semibold">{t('expense')}</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflowData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                    return value;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="Pemasukan" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  fill="url(#colorIncome)"
                  dot={{ fill: '#6366F1', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Pengeluaran" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  fill="url(#colorExpense)"
                  dot={{ fill: '#EF4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-teal-300 to-green-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-6 left-6 w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 drop-shadow-sm">{t('transactions')}</h2>
            <Link 
              href="/dashboard/transactions"
              className="text-sm text-[#6366F1] font-semibold hover:underline hover:scale-110 transition-transform"
            >
              {t('viewAll')}
            </Link>
          </div>

          <div className="relative z-10 space-y-3">
            {transactions.slice(0, 4).map((transaction) => {
              const Icon = getCategoryIcon(transaction.category.name);
              const isExpense = transaction.type === 'expense';
              
              return (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between bg-white rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform ${
                      isExpense ? 'bg-gradient-to-br from-red-100 to-rose-100' : 'bg-gradient-to-br from-green-100 to-emerald-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isExpense ? 'text-red-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {transaction.category.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {format(new Date(transaction.date), 'dd MMM • HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-black text-sm ${
                    isExpense ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount).replace('Rp', 'Rp')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-6 border border-purple-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-rose-300 to-purple-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-10 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6 relative z-10 drop-shadow-sm">{t('category')}</h2>

          {categoryExpenses.length > 0 ? (
            <div className="flex flex-col items-center relative z-10">
              <div className="relative w-48 h-48 mb-6 hover:scale-110 transition-transform duration-500">
                {/* Glow effect behind chart */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {(() => {
                      const totalExpense = categoryExpenses.reduce((sum, cat) => sum + cat.value, 0);
                      const topCategory = categoryExpenses[0];
                      const topPercentage = totalExpense > 0 
                        ? Math.round((topCategory.value / totalExpense) * 100)
                        : 0;
                      return (
                        <>
                          <p className="text-4xl font-black text-slate-900 animate-pulse drop-shadow-lg">{topPercentage}%</p>
                          <p className="text-sm text-slate-600 font-semibold">
                            {topPercentage > 60 ? t('dominant') : t('efficient')}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                {categoryExpenses.slice(0, 3).map((category, index) => {
                  const totalExpense = categoryExpenses.reduce((sum, cat) => sum + cat.value, 0);
                  const percentage = totalExpense > 0 
                    ? Math.round((category.value / totalExpense) * 100) 
                    : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-white rounded-xl p-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-md animate-pulse" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-slate-700 font-semibold">{category.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 relative z-10">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
                <p className="font-semibold">{ t('noCategory')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Budget Target */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-6 border border-orange-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Animated decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 left-10 w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6 relative z-10 drop-shadow-sm">{t('budgetTarget')}</h2>

          {budgetData.length > 0 ? (
            <div className="space-y-6 relative z-10">
              {budgetData.slice(0, 3).map((budget, index) => {
                const Icon = budget.icon;
                
                return (
                  <div key={index} className="bg-white rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{budget.name}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black px-3 py-1.5 rounded-full shadow-sm" style={{ 
                        color: budget.color,
                        backgroundColor: `${budget.color}20`
                      }}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ 
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-4 shadow-lg animate-bounce-slow">
                <PiggyBank className="w-10 h-10 text-orange-400" />
              </div>
              <p className="text-slate-400 mb-2 font-semibold">{t('noBudget')}</p>
              <Link 
                href="/dashboard/budget?action=add"
                className="text-sm text-[#6366F1] font-semibold hover:underline hover:scale-110 transition-transform"
              >
                {t('createBudget')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
