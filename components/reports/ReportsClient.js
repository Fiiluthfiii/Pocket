'use client';

import { useState, useEffect } from 'react';
import { Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { generateFinancialReport } from '@/lib/exportPDF';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCurrency } from '@/lib/currency';

// Translations
const translations = {
  id: {
    title: 'Laporan Keuangan',
    weekly: 'Minggu',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
    totalIncome: 'Total Pemasukan',
    totalExpense: 'Total Pengeluaran',
    exportReport: 'Export Laporan',
    expenseDistribution: 'Distribusi Pengeluaran',
    distributionDesc: 'Berdasarkan kategori utama bulan ini.',
    noExpenseData: 'Belum ada data pengeluaran',
    total: 'TOTAL',
    thisVsLast: 'Bulan Ini vs Lalu',
    savingsDifference: 'SELISIH TABUNGAN',
    betterThanLast: 'lebih baik dari bulan lalu',
    dailyAverage: 'Rata-rata Harian',
    biggestTransaction: 'Transaksi Terbesar',
    shoppingEfficiency: 'Efisiensi Belanja',
    frugal: 'HEMAT',
    wasteful: 'BOROS',
    viewDetailedComparison: 'Lihat Detail Perbandingan',
    loading: 'Memuat...',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
  },
  en: {
    title: 'Financial Reports',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expenses',
    exportReport: 'Export Report',
    expenseDistribution: 'Expense Distribution',
    distributionDesc: 'Based on main categories this month.',
    noExpenseData: 'No expense data yet',
    total: 'TOTAL',
    thisVsLast: 'This Month vs Last',
    savingsDifference: 'SAVINGS DIFFERENCE',
    betterThanLast: 'better than last month',
    dailyAverage: 'Daily Average',
    biggestTransaction: 'Biggest Transaction',
    shoppingEfficiency: 'Shopping Efficiency',
    frugal: 'FRUGAL',
    wasteful: 'WASTEFUL',
    viewDetailedComparison: 'View Detailed Comparison',
    loading: 'Loading...',
    income: 'Income',
    expense: 'Expenses',
  }
};

export default function ReportsClient({ userId }) {
  const { language, currency } = usePreferences();
  const t = (key) => translations[language]?.[key] || translations['id'][key] || key;
  
  // Local currency formatter using user preference
  const formatCurrencyLocal = (amount) => {
    return formatCurrency(amount, currency);
  };
  
  const [activeTab, setActiveTab] = useState(t('monthly'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;

    switch (activeTab) {
      case 'Minggu':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'Bulanan':
        startDate = startOfMonth(now);
        break;
      case 'Tahunan':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = startOfMonth(now);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate totals for current period
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate previous month totals
  const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
  const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
  
  const prevMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= prevMonthStart && tDate <= prevMonthEnd;
  });

  const prevMonthIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const prevMonthExpense = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate percentage changes
  const incomeChange = prevMonthIncome > 0 
    ? ((totalIncome - prevMonthIncome) / prevMonthIncome * 100).toFixed(0)
    : 0;
  
  const expenseChange = prevMonthExpense > 0
    ? ((totalExpense - prevMonthExpense) / prevMonthExpense * 100).toFixed(0)
    : 0;

  // Current month stats
  const currentMonthBalance = totalIncome - totalExpense;
  const prevMonthBalance = prevMonthIncome - prevMonthExpense;
  const balanceChange = prevMonthBalance !== 0 
    ? ((currentMonthBalance - prevMonthBalance) / Math.abs(prevMonthBalance) * 100).toFixed(1)
    : 0;

  // Daily average
  const daysInMonth = new Date().getDate();
  const dailyAverage = totalExpense / daysInMonth;

  // Biggest transaction
  const biggestTransaction = filteredTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

  // Efficiency
  const efficiency = expenseChange;

  // Chart data based on active tab
  const getChartData = () => {
    const weekly = t('weekly');
    const monthly = t('monthly');
    const yearly = t('yearly');
    const incomeLabel = t('income');
    const expenseLabel = t('expense');
    
    if (activeTab === weekly || activeTab === 'Minggu') {
      // Daily data for last 7 days
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));

        const dayTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= dayStart && tDate <= dayEnd;
        });

        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        chartData.push({
          date: format(day, 'dd MMM'),
          [incomeLabel]: income,
          [expenseLabel]: expense,
        });
      }
      return chartData;
    } else if (activeTab === monthly || activeTab === 'Bulanan') {
      // Weekly data for last 5 weeks
      const chartData = [];
      for (let i = 4; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);

        const weekTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= weekStart && tDate <= weekEnd;
        });

        const income = weekTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = weekTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        chartData.push({
          date: format(weekEnd, 'dd MMM'),
          [incomeLabel]: income,
          [expenseLabel]: expense,
        });
      }
      return chartData;
    } else {
      // Monthly data for last 12 months
      const chartData = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        chartData.push({
          date: format(monthDate, 'MMM', { locale: id }),
          [incomeLabel]: income,
          [expenseLabel]: expense,
        });
      }
      return chartData;
    }
  };

  const chartData = getChartData();

  // Handle export PDF
  const handleExportPDF = () => {
    const exportData = {
      totalIncome,
      totalExpense,
      currentMonthBalance,
      balanceChange,
      chartData,
      categoryData: categoryWithColors,
      transactions: filteredTransactions,
      period: `${activeTab} - ${format(new Date(), 'MMMM yyyy', { locale: id })}`,
      incomeChange: Number(incomeChange),
      expenseChange: Number(expenseChange),
    };
    
    generateFinancialReport(exportData);
  };

  // Category breakdown for pie chart
  const categoryData = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryData[t.category.name]) {
        categoryData[t.category.name] = {
          name: t.category.name,
          value: 0,
        };
      }
      categoryData[t.category.name].value += Number(t.amount);
    });

  const categoryChartData = Object.values(categoryData);
  
  // Assign colors to categories
  const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B'];
  const categoryWithColors = categoryChartData.map((cat, index) => ({
    ...cat,
    color: COLORS[index % COLORS.length],
  }));

  const totalCategoryExpense = categoryChartData.reduce((sum, cat) => sum + cat.value, 0);

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {payload[0].payload.date}
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        {[t('weekly'), t('monthly'), t('yearly')].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#6366F1] text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Pemasukan */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border border-green-200 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          {/* Animated decorative background circles */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-10 -right-5 w-24 h-24 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-30 animate-bounce-slow"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-teal-300 to-green-400 rounded-full opacity-15 animate-pulse"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-5 left-5 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-20 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10">
            <p className="text-sm text-slate-700 font-semibold mb-2 uppercase tracking-wide">{t('totalIncome')}</p>
            <div className="flex items-end gap-3 mb-1">
              <h2 className="text-4xl font-black text-green-600 drop-shadow-sm">
                {formatCurrencyLocal(totalIncome)}
              </h2>
              <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full mb-2 shadow-sm">
                {incomeChange > 0 ? `↗ ${incomeChange}%` : incomeChange < 0 ? `↘ ${Math.abs(incomeChange)}%` : '0%'}
              </span>
            </div>
            <button 
              onClick={handleExportPDF}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-[1.05] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('exportReport')}
            </button>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-3xl p-6 border border-red-200 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          {/* Animated decorative background circles */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-red-300 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-10 -right-5 w-24 h-24 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full opacity-30 animate-bounce-slow"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-pulse"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-5 left-5 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-20 w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10">
            <p className="text-sm text-slate-700 font-semibold mb-2 uppercase tracking-wide">{t('totalExpense')}</p>
            <div className="flex items-end gap-3 mb-1">
              <h2 className="text-4xl font-black text-red-500 drop-shadow-sm">
                {formatCurrencyLocal(totalExpense)}
              </h2>
              <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full mb-2 shadow-sm">
                {expenseChange > 0 ? `↗ ${expenseChange}%` : expenseChange < 0 ? `↘ ${Math.abs(expenseChange)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
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
                dataKey={t('income')}
                stroke="#10B981" 
                strokeWidth={3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey={t('expense')}
                stroke="#EF4444" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Pengeluaran */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          {/* Animated decorative circles - Pattern 1 */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-purple-300 to-fuchsia-400 rounded-full opacity-15 animate-spin-slow"></div>
          <div className="absolute top-20 -right-8 w-24 h-24 bg-gradient-to-br from-fuchsia-300 to-pink-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full opacity-10 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-12 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Sparkle effects - 5 sparkles dengan posisi berbeda */}
          <div className="absolute top-6 left-6 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-16 left-16 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-8 right-24 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-fuchsia-500 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm">{t('expenseDistribution')}</h2>
              <p className="text-sm text-slate-700 font-semibold">{t('distributionDesc')}</p>
            </div>
            <button className="p-3 hover:bg-white/50 backdrop-blur-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 group">
              <MoreVertical className="w-5 h-5 text-purple-600 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {categoryChartData.length > 0 ? (
            <div className="relative z-10">
              {/* Donut Chart di atas - center */}
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64 group-hover:scale-110 transition-transform duration-500">
                  {/* Glow effect di belakang chart */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-slate-900 drop-shadow-sm">
                      {formatCurrencyLocal(totalCategoryExpense)}
                    </p>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">{t('total')}</p>
                  </div>
                </div>
              </div>

              {/* Legend di bawah - dalam grid 2 kolom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryWithColors.map((category, index) => {
                  const percentage = totalCategoryExpense > 0 
                    ? Math.round((category.value / totalCategoryExpense) * 100)
                    : 0;
                  
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-white/50 group relative overflow-hidden">
                      {/* Mini glow effect per item */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: category.color }}></div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full shadow-lg animate-pulse group-hover:scale-125 transition-transform" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-base text-slate-900 font-black">{category.name}</span>
                        </div>
                        <span className="text-lg font-black text-slate-900 px-4 py-2 rounded-xl shadow-sm" style={{ backgroundColor: `${category.color}20` }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative z-10 h-48 flex items-center justify-center text-center">
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
                  <PieChart className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-slate-400 font-bold">{t('noExpenseData')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bulan Ini vs Lalu */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          {/* Animated decorative circles - Pattern 2 (BERBEDA dari card sebelah) */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-bounce-slow"></div>
          <div className="absolute top-16 -right-6 w-28 h-28 bg-gradient-to-br from-indigo-300 to-cyan-400 rounded-full opacity-15 animate-spin-slow" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute -bottom-10 -left-10 w-30 h-30 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-18 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 animate-bounce-slow" style={{ animationDelay: '1.3s' }}></div>
          
          {/* Sparkle effects - 5 sparkles dengan posisi BERBEDA dari card sebelah */}
          <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-20 left-12 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute bottom-12 right-16 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          
          <h2 className="relative z-10 text-2xl font-black text-slate-900 mb-6 drop-shadow-sm">{t('thisVsLast')}</h2>
          
          <div className="relative z-10 space-y-5">
            {/* Selisih Tabungan */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all border-2 border-green-300 relative overflow-hidden group">
              {/* Mini sparkles */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              
              <p className="text-xs text-white/80 uppercase font-bold mb-2 tracking-wider">{t('savingsDifference')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white drop-shadow-lg">
                  +{formatCurrencyLocal(currentMonthBalance)}
                </span>
              </div>
              <p className="text-xs text-white/90 mt-2 font-semibold">
                ↑ {Math.abs(balanceChange)}% {t('betterThanLast')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Rata-rata Harian */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-white/40 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm text-slate-600 uppercase font-bold">{t('dailyAverage')}</span>
                  <span className="text-2xl font-black text-blue-600 drop-shadow-sm">
                    {formatCurrencyLocal(dailyAverage)}
                  </span>
                </div>
              </div>

              {/* Transaksi Terbesar */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-white/40 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-red-300 rounded-full opacity-20 animate-bounce-slow"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm text-slate-600 uppercase font-bold">{t('biggestTransaction')}</span>
                  <span className="text-2xl font-black text-red-500 drop-shadow-sm">
                    {biggestTransaction ? formatCurrencyLocal(biggestTransaction.amount) : formatCurrencyLocal(0)}
                  </span>
                </div>
              </div>

              {/* Efisiensi Belanja */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all border border-white/40 relative overflow-hidden group">
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-indigo-300 to-cyan-400 rounded-full opacity-15 animate-spin-slow"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm text-slate-600 uppercase font-bold">{t('shoppingEfficiency')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-black ${efficiency < 0 ? 'text-green-600' : 'text-red-500'} drop-shadow-sm`}>
                      {efficiency < 0 ? '+' : ''}{Math.abs(efficiency)}%
                    </span>
                    <span className={`text-xs font-bold px-3 py-2 rounded-full ${
                      efficiency < 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    } shadow-md`}>
                      {efficiency < 0 ? t('frugal') : t('wasteful')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Button dengan gradient mewah */}
            <button className="w-full px-6 py-4 bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white rounded-2xl font-black hover:shadow-lg hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group">
              <span className="relative z-10">{t('viewDetailedComparison')}</span>
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
