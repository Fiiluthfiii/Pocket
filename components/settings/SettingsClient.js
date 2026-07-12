'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Lock, Settings as SettingsIcon, Bell, Database, Camera, Search, Moon, Sun, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { useSettingsTranslations } from './SettingsClientTranslated';

export default function SettingsClient({ user }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeMenu, setActiveMenu] = useState(tabParam || 'profile');
  const { language } = usePreferences();
  const t = useSettingsTranslations(language);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferencesData, setPreferencesData] = useState({
    currency: 'IDR',
    language: 'id',
    timezone: 'Asia/Jakarta',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  });
  const [notificationData, setNotificationData] = useState({
    email: true,
    push: true,
    transaction: true,
    budget: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load language and currency from localStorage
    const savedLanguage = localStorage.getItem('language') || 'id';
    const savedCurrency = localStorage.getItem('currency') || 'IDR';
    setPreferencesData(prev => ({
      ...prev,
      language: savedLanguage,
      currency: savedCurrency
    }));
  }, []);

  // Update dark mode
  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Update language
  const updateLanguage = (language) => {
    setPreferencesData(prev => ({ ...prev, language }));
    localStorage.setItem('language', language);
    // Update document language attribute
    document.documentElement.lang = language;
    // Trigger event to notify other components
    window.dispatchEvent(new Event('preferencesChanged'));
    // Show success message
    setMessage({ type: 'success', text: language === 'id' ? 'Bahasa diubah ke Indonesia' : 'Language changed to English' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  // Update currency
  const updateCurrency = (currency) => {
    setPreferencesData(prev => ({ ...prev, currency }));
    localStorage.setItem('currency', currency);
    // Trigger event to notify other components
    window.dispatchEvent(new Event('preferencesChanged'));
    // Show success message
    const currencyNames = {
      IDR: 'Rupiah Indonesia',
      USD: 'US Dollar',
      EUR: 'Euro',
      SGD: 'Singapore Dollar',
      MYR: 'Malaysian Ringgit'
    };
    setMessage({ type: 'success', text: `Mata uang diubah ke ${currencyNames[currency]}` });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const menuItems = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Keamanan', icon: Lock },
    { id: 'preferences', label: 'Preferensi', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'data', label: 'Data', icon: Database },
  ];

  // Update activeMenu when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveMenu(tabParam);
    }
  }, [tabParam]);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (response.ok && data.user) {
          setProfileData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal update profil');
      }

      // Update state dengan data yang dikembalikan dari server
      if (data.user) {
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
        });
      }

      setMessage({ type: 'success', text: data.message || 'Profil berhasil diperbarui!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal ubah password');
      }

      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Masukkan password untuk menghapus akun');
      return;
    }

    setLoading(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.message || 'Gagal menghapus akun');
        setLoading(false);
        return;
      }

      // Close modal and show success message
      setShowDeleteModal(false);
      setMessage({ type: 'success', text: 'Akun berhasil dihapus. Mengalihkan...' });
      
      // Logout and redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setDeleteError(error.message || 'Terjadi kesalahan saat menghapus akun');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent drop-shadow-lg">
            {t('title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-start ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Layout: Full Width Content (No Sidebar) */}
      <div>
        {/* Content Area */}
        <div>
          {/* Profile Content */}
          {activeMenu === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                {/* Foto Profil Section */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('profilePhoto')}</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-upload"
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {t('changePhoto')}
                      </label>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-slate-500 mt-2">{t('photoFormat')}</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={t('fullNamePlaceholder')}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={t('emailPlaceholder')}
                      required
                    />
                  </div>

                  {/* Nomor Telepon */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('phone')}
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20">
                        <input
                          type="text"
                          value="+62"
                          disabled
                          className="w-full px-3 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 text-center"
                        />
                      </div>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Bio Singkat */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('bio')}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder={t('bioPlaceholder')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? t('saving') : t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Content */}
          {activeMenu === 'security' && (
            <div className="space-y-6">
              {/* Ubah Kata Sandi Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
                <div className="flex items-start gap-3 mb-6">
                  <Lock className="w-6 h-6 text-[#6366F1] mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('changePassword')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('changePasswordDesc')}</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Kata Sandi Saat Ini */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('currentPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kata Sandi Baru */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t('newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={t('passwordMin')}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{t('passwordMin')}</p>
                    </div>

                    {/* Konfirmasi Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t('confirmPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={t('passwordRepeat')}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{t('passwordRepeat')}</p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('passwordInfo')}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-3 bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? t('updating') : t('updatePassword')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tutup Akun Card */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{t('closeAccount')}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('closeAccountDesc')}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all"
                  >
                    {t('deleteAccountBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Content */}
          {activeMenu === 'preferences' && (
            <div className="space-y-6 relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

              {/* Header */}
              <div className="relative">
                <h2 className="text-3xl font-black bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent drop-shadow-lg">{t('preferences')}</h2>
                <p className="text-slate-500 mt-1">{t('preferencesDesc')}</p>
              </div>

              {/* MODE TAMPILAN */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('displayMode')}</label>
                <div className="flex gap-3">
                  {/* Terang */}
                  <button
                    onClick={() => toggleDarkMode(false)}
                    className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-xl transition-all hover:scale-105 ${
                      !darkMode
                        ? 'border-[#6366F1] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !darkMode 
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                        : 'bg-slate-100'
                    }`}>
                      <Sun className={`w-5 h-5 ${!darkMode ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-sm font-bold text-slate-900">{t('light')}</h3>
                      <p className="text-xs text-slate-500">{t('lightDesc')}</p>
                    </div>
                    {!darkMode && (
                      <CheckCircle className="w-5 h-5 text-[#6366F1] flex-shrink-0" />
                    )}
                  </button>

                  {/* Gelap */}
                  <button
                    onClick={() => toggleDarkMode(true)}
                    className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-xl transition-all hover:scale-105 ${
                      darkMode
                        ? 'border-[#6366F1] bg-gradient-to-r from-slate-700 to-slate-800 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      darkMode 
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                        : 'bg-slate-100'
                    }`}>
                      <Moon className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('dark')}</h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{t('darkDesc')}</p>
                    </div>
                    {darkMode && (
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* BAHASA & WILAYAH and MATA UANG UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Bahasa & Wilayah */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('languageRegion')}</label>
                  <select
                    value={preferencesData.language}
                    onChange={(e) => updateLanguage(e.target.value)}
                    className="relative w-full px-4 py-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-700 dark:text-slate-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
                  >
                    <option value="id">Bahasa Indonesia (ID)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                {/* Mata Uang Utama */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('primaryCurrency')}</label>
                  <select
                    value={preferencesData.currency}
                    onChange={(e) => updateCurrency(e.target.value)}
                    className="relative w-full px-4 py-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-700 dark:text-slate-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
                  >
                    <option value="IDR">🇮🇩 IDR Rupiah Indonesia</option>
                    <option value="USD">🇺🇸 USD - US Dollar</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                    <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                    <option value="MYR">🇲🇾 MYR - Malaysian Ringgit</option>
                  </select>
                </div>
              </div>

              {/* KALENDER & PENJADWALAN */}
              <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl border-2 border-slate-200 p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all">
                {/* Animated decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full blur-3xl opacity-20 animate-spin-slow" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-300 to-yellow-300 rounded-full blur-2xl opacity-30 animate-bounce-slow" />
                
                <div className="relative flex items-start gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-bounce-slow">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow">{t('calendar')}</h3>
                    <p className="text-sm text-slate-600">{t('calendarDesc')}</p>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="relative border-2 border-slate-200 rounded-2xl p-4 bg-white shadow-inner">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => {
                        const newDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
                        setPreferencesData({ ...preferencesData, currentMonth: newDate.getMonth(), currentYear: newDate.getFullYear() });
                      }}
                      className="p-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all transform hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="font-bold text-slate-900">
                      {new Date(preferencesData.currentYear || new Date().getFullYear(), preferencesData.currentMonth || new Date().getMonth()).toLocaleDateString(preferencesData.language === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => {
                        const newDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1);
                        setPreferencesData({ ...preferencesData, currentMonth: newDate.getMonth(), currentYear: newDate.getFullYear() });
                      }}
                      className="p-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all transform hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {[t('dayMon'), t('dayTue'), t('dayWed'), t('dayThu'), t('dayFri'), t('daySat'), t('daySun')].map((day) => (
                      <div key={day} className="text-center text-xs font-bold text-slate-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid with Real Date */}
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const today = new Date();
                      const currentMonth = preferencesData.currentMonth !== undefined ? preferencesData.currentMonth : today.getMonth();
                      const currentYear = preferencesData.currentYear !== undefined ? preferencesData.currentYear : today.getFullYear();
                      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      const startDay = firstDay === 0 ? 6 : firstDay - 1;
                      
                      return [...Array(35)].map((_, i) => {
                        const day = i - startDay + 1;
                        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                        const isInMonth = day > 0 && day <= daysInMonth;
                        
                        return (
                          <button
                            key={i}
                            className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all transform ${
                              isToday
                                ? 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white font-black shadow-xl shadow-purple-500/40 scale-110 animate-pulse'
                                : isInMonth
                                ? 'hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 text-slate-700 hover:scale-110 hover:font-bold hover:shadow-lg'
                                : 'text-slate-300'
                            }`}
                          >
                            {isInMonth ? day : ''}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Content - Coming Soon */}
          {activeMenu === 'notifications' && (
            <div className="relative min-h-[500px] bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 rounded-3xl p-12 flex items-center justify-center overflow-hidden">
              {/* Subtle Background Decoration with animation */}
              <div className="absolute top-10 right-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Content */}
              <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                {/* Icon with animation */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Bell className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">{t('comingSoon')}</p>
                  <h2 className="text-4xl font-black text-slate-900 mb-3">{t('notificationsTitle')}</h2>
                  <p className="text-lg text-slate-600">
                    {t('notificationsDesc')}
                  </p>
                </div>

                {/* Features Grid with staggered animation */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('pushNotifications')}</h4>
                    <p className="text-xs text-slate-500">{t('pushNotificationsDesc')}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('smartAlerts')}</h4>
                    <p className="text-xs text-slate-500">{t('smartAlertsDesc')}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('customizable')}</h4>
                    <p className="text-xs text-slate-500">{t('customizableDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Content - Coming Soon */}
          {activeMenu === 'data' && (
            <div className="relative min-h-[500px] bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-teal-50/50 rounded-3xl p-12 flex items-center justify-center overflow-hidden">
              {/* Subtle Background Decoration with animation */}
              <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Content */}
              <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                {/* Icon with animation */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Database className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">{t('comingSoon')}</p>
                  <h2 className="text-4xl font-black text-slate-900 mb-3">{t('dataTitle')}</h2>
                  <p className="text-lg text-slate-600">
                    {t('dataDesc')}
                  </p>
                </div>

                {/* Features Grid with staggered animation */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('exportData')}</h4>
                    <p className="text-xs text-slate-500">{t('exportDataDesc')}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('privacyControl')}</h4>
                    <p className="text-xs text-slate-500">{t('privacyControlDesc')}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="w-12 h-12 bg-teal-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{t('backupRestore')}</h4>
                    <p className="text-xs text-slate-500">{t('backupRestoreDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('deleteTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm mb-6">
              {t('deleteSubtitle')}
            </p>

            {/* Warning Box */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <p className="font-semibold mb-1">{t('willBeDeleted')}</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>{t('yourAccount')}</li>
                    <li>{t('allTransactions')}</li>
                    <li>{t('walletsCategories')}</li>
                    <li>{t('budgetGoals')}</li>
                    <li>{t('reportsHistory')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('enterPassword')}
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError(''); // Clear error when typing
                  }}
                  className={`w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border ${
                    deleteError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Error Alert */}
              {deleteError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300">{deleteError}</p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setShowDeletePassword(false);
                  setDeleteError('');
                  setMessage({ type: '', text: '' });
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading || !deletePassword}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t('deleting') : t('yesDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
