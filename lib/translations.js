// Simple translation utility

const translations = {
  id: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transaksi',
    'nav.categories': 'Kategori',
    'nav.budget': 'Anggaran',
    'nav.reports': 'Laporan',
    'nav.wallets': 'Dompet',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',

    // Settings
    'settings.profile': 'Profil',
    'settings.security': 'Keamanan',
    'settings.preferences': 'Preferensi',
    'settings.notifications': 'Notifikasi',
    'settings.data': 'Data',
    'settings.title': 'Pengaturan',
    'settings.subtitle': 'Kelola profil dan preferensi akun Anda',
    'settings.search': 'Cari pengaturan...',

    // Profile
    'profile.photo': 'Foto Profil',
    'profile.changePhoto': 'Ubah Foto',
    'profile.photoFormat': 'Format: JPG, PNG. Max 2MB',
    'profile.fullName': 'Nama Lengkap',
    'profile.fullNamePlaceholder': 'Masukkan nama lengkap',
    'profile.email': 'Email',
    'profile.phone': 'Nomor Telepon',
    'profile.phonePlaceholder': '812-3456-7890',
    'profile.bio': 'Bio Singkat',
    'profile.bioPlaceholder': 'Ceritakan sedikit tentang diri Anda...',
    'profile.saveChanges': 'Simpan Perubahan',
    'profile.saving': 'Menyimpan...',

    // Security
    'security.changePassword': 'Ubah Kata Sandi',
    'security.changePasswordDesc': 'Kelola kata sandi dan pengaturan keamanan akun Anda untuk melindungi data finansial.',
    'security.currentPassword': 'Kata Sandi Saat Ini',
    'security.newPassword': 'Kata Sandi Baru',
    'security.confirmPassword': 'Konfirmasi Password',
    'security.passwordMin': 'Min. 8 karakter',
    'security.passwordRepeat': 'Ulangi kata sandi',
    'security.passwordInfo': 'Pastikan kata sandi baru Anda unik dan tidak dipakai untuk akun lain. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.',
    'security.updatePassword': 'Perbarui Kata Sandi',
    'security.updating': 'Memperbarui...',
    'security.closeAccount': 'Tutup Akun',
    'security.closeAccountDesc': 'Menghapus akun Anda bersifat permanen. Seluruh data transaksi, kategori, dan laporan akan dihapus selamanya dari sistem kami.',
    'security.deleteAccount': 'Hapus Akun Pocket',

    // Preferences
    'preferences.title': 'Preferensi',
    'preferences.subtitle': 'Personalisasikan pengalaman Pocket Anda sesuai kenyamanan.',
    'preferences.displayMode': 'MODE TAMPILAN',
    'preferences.light': 'Terang',
    'preferences.lightDesc': 'Sempurna untuk penggunaan di siang hari.',
    'preferences.dark': 'Gelap',
    'preferences.darkDesc': 'Nyaman untuk mata di kondisi minim cahaya.',
    'preferences.language': 'BAHASA & WILAYAH',
    'preferences.currency': 'MATA UANG UTAMA',
    'preferences.calendar': 'Kalender & Penjadwalan',
    'preferences.calendarDesc': 'Atur jadwal dan format waktu sesuai preferensi Anda di seluruh aplikasi.',

    // Delete Account Modal
    'deleteAccount.title': 'Hapus Akun Pocket?',
    'deleteAccount.subtitle': 'Tindakan ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus secara permanen.',
    'deleteAccount.willBeDeleted': 'Yang akan dihapus:',
    'deleteAccount.account': 'Akun Anda',
    'deleteAccount.transactions': 'Semua transaksi Anda',
    'deleteAccount.wallets': 'Semua wallet dan kategori',
    'deleteAccount.budgets': 'Budget dan saving goals',
    'deleteAccount.reports': 'Laporan dan riwayat',
    'deleteAccount.enterPassword': 'Masukkan Password Anda untuk Konfirmasi',
    'deleteAccount.cancel': 'Batal',
    'deleteAccount.confirm': 'Ya, Hapus Akun',
    'deleteAccount.deleting': 'Menghapus...',

    // Coming Soon
    'comingSoon.title': 'SEGERA HADIR',
    'comingSoon.notifications': 'Notifikasi',
    'comingSoon.notificationsDesc': 'Kami sedang mempersiapkan sistem notifikasi yang lengkap untuk memberikan informasi real-time tentang aktivitas keuangan Anda.',
    'comingSoon.data': 'Data & Privasi',
    'comingSoon.dataDesc': 'Fitur manajemen data dan privasi sedang dalam tahap pengembangan untuk memberikan Anda kontrol penuh atas informasi pribadi Anda.',

    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.add': 'Tambah',
    'common.search': 'Cari',
    'common.loading': 'Memuat...',
    'common.success': 'Berhasil',
    'common.error': 'Gagal',

    // Days
    'day.sun': 'Min',
    'day.mon': 'Sen',
    'day.tue': 'Sel',
    'day.wed': 'Rab',
    'day.thu': 'Kam',
    'day.fri': 'Jum',
    'day.sat': 'Sab',

    // Months
    'month.january': 'Januari',
    'month.february': 'Februari',
    'month.march': 'Maret',
    'month.april': 'April',
    'month.may': 'Mei',
    'month.june': 'Juni',
    'month.july': 'Juli',
    'month.august': 'Agustus',
    'month.september': 'September',
    'month.october': 'Oktober',
    'month.november': 'November',
    'month.december': 'Desember',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.categories': 'Categories',
    'nav.budget': 'Budget',
    'nav.reports': 'Reports',
    'nav.wallets': 'Wallets',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Settings
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Notifications',
    'settings.data': 'Data',
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account profile and preferences',
    'settings.search': 'Search settings...',

    // Profile
    'profile.photo': 'Profile Photo',
    'profile.changePhoto': 'Change Photo',
    'profile.photoFormat': 'Format: JPG, PNG. Max 2MB',
    'profile.fullName': 'Full Name',
    'profile.fullNamePlaceholder': 'Enter your full name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.phonePlaceholder': '812-3456-7890',
    'profile.bio': 'Short Bio',
    'profile.bioPlaceholder': 'Tell us a little about yourself...',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',

    // Security
    'security.changePassword': 'Change Password',
    'security.changePasswordDesc': 'Manage your password and security settings to protect your financial data.',
    'security.currentPassword': 'Current Password',
    'security.newPassword': 'New Password',
    'security.confirmPassword': 'Confirm Password',
    'security.passwordMin': 'Min. 8 characters',
    'security.passwordRepeat': 'Repeat password',
    'security.passwordInfo': 'Make sure your new password is unique and not used for other accounts. Use a combination of uppercase, lowercase, numbers, and symbols.',
    'security.updatePassword': 'Update Password',
    'security.updating': 'Updating...',
    'security.closeAccount': 'Close Account',
    'security.closeAccountDesc': 'Deleting your account is permanent. All your transaction data, categories, and reports will be permanently deleted from our system.',
    'security.deleteAccount': 'Delete Pocket Account',

    // Preferences
    'preferences.title': 'Preferences',
    'preferences.subtitle': 'Personalize your Pocket experience to your comfort.',
    'preferences.displayMode': 'DISPLAY MODE',
    'preferences.light': 'Light',
    'preferences.lightDesc': 'Perfect for daytime use.',
    'preferences.dark': 'Dark',
    'preferences.darkDesc': 'Easy on the eyes in low light conditions.',
    'preferences.language': 'LANGUAGE & REGION',
    'preferences.currency': 'PRIMARY CURRENCY',
    'preferences.calendar': 'Calendar & Scheduling',
    'preferences.calendarDesc': 'Set schedule and time format according to your preferences throughout the application.',

    // Delete Account Modal
    'deleteAccount.title': 'Delete Pocket Account?',
    'deleteAccount.subtitle': 'This action cannot be undone. All your data will be permanently deleted.',
    'deleteAccount.willBeDeleted': 'What will be deleted:',
    'deleteAccount.account': 'Your Account',
    'deleteAccount.transactions': 'All your transactions',
    'deleteAccount.wallets': 'All wallets and categories',
    'deleteAccount.budgets': 'Budgets and saving goals',
    'deleteAccount.reports': 'Reports and history',
    'deleteAccount.enterPassword': 'Enter Your Password to Confirm',
    'deleteAccount.cancel': 'Cancel',
    'deleteAccount.confirm': 'Yes, Delete Account',
    'deleteAccount.deleting': 'Deleting...',

    // Coming Soon
    'comingSoon.title': 'COMING SOON',
    'comingSoon.notifications': 'Notifications',
    'comingSoon.notificationsDesc': 'We are preparing a comprehensive notification system to provide you with real-time information about your financial activities.',
    'comingSoon.data': 'Data & Privacy',
    'comingSoon.dataDesc': 'Data management and privacy features are under development to give you full control over your personal information.',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',

    // Days
    'day.sun': 'Sun',
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.wed': 'Wed',
    'day.thu': 'Thu',
    'day.fri': 'Fri',
    'day.sat': 'Sat',

    // Months
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December',
  }
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code (id or en)
 * @returns {string} Translated text
 */
export function translate(key, language = null) {
  const lang = language || (typeof window !== 'undefined' ? localStorage.getItem('language') : null) || 'id';
  return translations[lang]?.[key] || translations.id[key] || key;
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'id';
  }
  return 'id';
}

export default {
  translate,
  getCurrentLanguage,
  translations
};
