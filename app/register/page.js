'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
import '../login-animations.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (!formData.agree) {
      setError('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      // Redirect ke login dengan pesan sukses
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${mounted ? 'animate-blob' : ''}`}></div>
        <div className={`absolute top-40 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${mounted ? 'animate-blob animation-delay-2000' : ''}`}></div>
        <div className={`absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${mounted ? 'animate-blob animation-delay-4000' : ''}`}></div>
      </div>

      {/* Left Side - Enhanced Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] p-12 items-center justify-center relative overflow-hidden">
        {/* Animated Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className={`absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl ${mounted ? 'animate-pulse' : ''}`}></div>
          <div className={`absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl ${mounted ? 'animate-pulse animation-delay-1000' : ''}`}></div>
          <div className={`absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl ${mounted ? 'animate-rotate-slow' : ''}`}></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 ${mounted ? 'animate-float' : ''}`}>
            <Sparkles className="w-12 h-12 text-white/20" />
          </div>
          <div className={`absolute top-1/3 right-1/4 ${mounted ? 'animate-float animation-delay-1000' : ''}`}>
            <TrendingUp className="w-10 h-10 text-white/20" />
          </div>
          <div className={`absolute bottom-1/4 left-1/3 ${mounted ? 'animate-float animation-delay-2000' : ''}`}>
            <CheckCircle className="w-11 h-11 text-white/20" />
          </div>
        </div>
        
        <div className={`relative z-10 max-w-md w-full ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className={`text-5xl font-bold text-white mb-6 leading-tight ${mounted ? 'animate-text-shimmer' : ''}`}>
            Kontrol Penuh<br />Atas<br />Keuanganmu
          </h1>

          <p className={`text-white/80 text-lg mb-12 ${mounted ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
            Mulai perjalanan finansialmu hari ini. Daftar gratis dan nikmati semua fitur premium.
          </p>

          {/* Enhanced Balance Card */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl ${mounted ? 'animate-pulse-glow' : ''}`}>
            <div className="mb-6">
              <p className={`text-white/70 text-sm mb-2 uppercase tracking-wider ${mounted ? 'animate-fade-in animation-delay-500' : 'opacity-0'}`}>Total Saldo</p>
              <h2 className={`text-4xl font-bold text-white mb-1 ${mounted ? 'animate-bounce-gentle animation-delay-700' : 'opacity-0'}`}>Rp 42.500.000</h2>
              <p className={`text-emerald-300 text-sm flex items-center gap-1 ${mounted ? 'animate-fade-in animation-delay-900' : 'opacity-0'}`}>
                <TrendingUp className={`w-4 h-4 ${mounted ? 'animate-bounce-gentle' : ''}`} />
                +8.5% bulan ini
              </p>
            </div>

            {/* Animated Chart */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6 h-32 flex items-end justify-center gap-3">
              <div className={`w-12 h-16 bg-emerald-400 rounded-full opacity-80 ${mounted ? 'animate-grow-bar animate-bounce-gentle' : ''}`}></div>
              <div className={`w-12 h-24 bg-emerald-400 rounded-full ${mounted ? 'animate-grow-bar animation-delay-200 animate-bounce-gentle animation-delay-100' : ''}`}></div>
              <div className={`w-12 h-12 bg-rose-400 rounded-full opacity-80 ${mounted ? 'animate-grow-bar animation-delay-400 animate-bounce-gentle animation-delay-150' : ''}`}></div>
              <div className={`w-12 h-20 bg-emerald-400 rounded-full opacity-80 ${mounted ? 'animate-grow-bar animation-delay-600 animate-bounce-gentle animation-delay-200' : ''}`}></div>
              <div className={`w-12 h-14 bg-rose-400 rounded-full opacity-80 ${mounted ? 'animate-grow-bar animation-delay-800 animate-bounce-gentle animation-delay-300' : ''}`}></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-white/5 rounded-2xl p-4 backdrop-blur hover:bg-white/10 transition-all ${mounted ? 'animate-scale-in animation-delay-1000' : 'opacity-0'}`}>
                <p className="text-white/70 text-sm mb-1">Pemasukan</p>
                <p className={`text-emerald-300 font-semibold flex items-center gap-1 ${mounted ? 'animate-bounce-gentle' : ''}`}>
                  +12%
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </p>
              </div>
              <div className={`bg-white/5 rounded-2xl p-4 backdrop-blur hover:bg-white/10 transition-all ${mounted ? 'animate-scale-in animation-delay-1100' : 'opacity-0'}`}>
                <p className="text-white/70 text-sm mb-1">Pengeluaran</p>
                <p className={`text-rose-300 font-semibold flex items-center gap-1 ${mounted ? 'animate-bounce-gentle animation-delay-100' : ''}`}>
                  -5%
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className={`w-full max-w-md ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
          {/* Logo for Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl">Pocket</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Buat Akun Baru 🚀</h2>
            <p className="text-slate-600">Mulai langkah pertama menuju kebebasan finansial bersama Pocket.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div className="transform transition-all hover:scale-[1.01]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="transform transition-all hover:scale-[1.01]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="transform transition-all hover:scale-[1.01]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="transform transition-all hover:scale-[1.01]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="w-5 h-5 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={formData.agree}
                onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                className="mt-1 w-4 h-4 text-[#6366F1] border-slate-300 rounded focus:ring-[#6366F1]"
              />
              <label htmlFor="agree" className="text-sm text-slate-600">
                Saya menyetujui <span className="text-[#6366F1] font-medium">Syarat & Ketentuan</span> serta <span className="text-[#6366F1] font-medium">Kebijakan Privasi</span> yang berlaku.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold py-4 rounded-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Memproses...' : 'Daftar Akun'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-500 uppercase text-xs font-medium">atau</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-medium py-4 rounded-xl hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Sudah punya akun? <Link href="/login" className="text-[#6366F1] font-semibold hover:underline">Masuk sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
