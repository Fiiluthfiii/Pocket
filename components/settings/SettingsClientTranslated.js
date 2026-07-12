// This file contains all translated text strings for Settings page
// Import this in SettingsClient to use t() function

export function useSettingsTranslations(language) {
  const t = (key) => {
    const translations = {
      id: {
        // Header
        title: 'Pengaturan',
        subtitle: 'Kelola profil dan preferensi akun Anda',
        searchPlaceholder: 'Cari pengaturan...',
        
        // Profile
        profilePhoto: 'Foto Profil',
        changePhoto: 'Ubah Foto',
        photoFormat: 'Format: JPG, PNG. Max 2MB',
        fullName: 'Nama Lengkap',
        fullNamePlaceholder: 'Masukkan nama lengkap',
        email: 'Email',
        emailPlaceholder: 'email@example.com',
        phone: 'Nomor Telepon',
        phonePlaceholder: '812-3456-7890',
        bio: 'Bio Singkat',
        bioPlaceholder: 'Ceritakan sedikit tentang diri Anda...',
        saveChanges: 'Simpan Perubahan',
        saving: 'Menyimpan...',
        
        // Security
        changePassword: 'Ubah Kata Sandi',
        changePasswordDesc: 'Kelola kata sandi dan pengaturan keamanan akun Anda untuk melindungi data finansial.',
        currentPassword: 'Kata Sandi Saat Ini',
        newPassword: 'Kata Sandi Baru',
        confirmPassword: 'Konfirmasi Password',
        passwordMin: 'Min. 8 karakter',
        passwordRepeat: 'Ulangi kata sandi',
        passwordInfo: 'Pastikan kata sandi baru Anda unik dan tidak dipakai untuk akun lain. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.',
        updatePassword: 'Perbarui Kata Sandi',
        updating: 'Memperbarui...',
        closeAccount: 'Tutup Akun',
        closeAccountDesc: 'Menghapus akun Anda bersifat permanen. Seluruh data transaksi, kategori, dan laporan akan dihapus selamanya dari sistem kami.',
        deleteAccountBtn: 'Hapus Akun Pocket',
        
        // Preferences
        preferences: 'Preferensi',
        preferencesDesc: 'Personalisasikan pengalaman Pocket Anda sesuai kenyamanan.',
        displayMode: 'MODE TAMPILAN',
        light: 'Terang',
        lightDesc: 'Sempurna untuk penggunaan di siang hari.',
        dark: 'Gelap',
        darkDesc: 'Nyaman untuk mata di kondisi minim cahaya.',
        languageRegion: 'BAHASA & WILAYAH',
        primaryCurrency: 'MATA UANG UTAMA',
        calendar: 'Kalender & Penjadwalan',
        calendarDesc: 'Atur jadwal dan format waktu sesuai preferensi Anda di seluruh aplikasi.',
        
        // Day names
        daySun: 'Min',
        dayMon: 'Sen',
        dayTue: 'Sel',
        dayWed: 'Rab',
        dayThu: 'Kam',
        dayFri: 'Jum',
        daySat: 'Sab',
        
        // Delete Modal
        deleteTitle: 'Hapus Akun Pocket?',
        deleteSubtitle: 'Tindakan ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus secara permanen.',
        willBeDeleted: 'Yang akan dihapus:',
        yourAccount: 'Akun Anda',
        allTransactions: 'Semua transaksi Anda',
        walletsCategories: 'Semua wallet dan kategori',
        budgetGoals: 'Budget dan saving goals',
        reportsHistory: 'Laporan dan riwayat',
        enterPassword: 'Masukkan Password Anda untuk Konfirmasi',
        cancel: 'Batal',
        yesDelete: 'Ya, Hapus Akun',
        deleting: 'Menghapus...',
        
        // Coming Soon
        comingSoon: 'SEGERA HADIR',
        
        // Notifications
        notificationsTitle: 'Notifikasi',
        notificationsDesc: 'Kami sedang merancang sistem notifikasi yang sempurna untuk Anda',
        pushNotifications: 'Push Notifications',
        pushNotificationsDesc: 'Real-time alerts',
        smartAlerts: 'Smart Alerts',
        smartAlertsDesc: 'Budget warnings',
        customizable: 'Customizable',
        customizableDesc: 'Your preferences',
        
        // Data
        dataTitle: 'Data & Privasi',
        dataDesc: 'Fitur manajemen data yang powerful sedang dalam pengembangan',
        exportData: 'Export Data',
        exportDataDesc: 'CSV & JSON format',
        privacyControl: 'Privacy Control',
        privacyControlDesc: 'Full data control',
        backupRestore: 'Backup & Restore',
        backupRestoreDesc: 'Never lose data',
      },
      en: {
        // Header
        title: 'Settings',
        subtitle: 'Manage your account profile and preferences',
        searchPlaceholder: 'Search settings...',
        
        // Profile
        profilePhoto: 'Profile Photo',
        changePhoto: 'Change Photo',
        photoFormat: 'Format: JPG, PNG. Max 2MB',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        email: 'Email',
        emailPlaceholder: 'email@example.com',
        phone: 'Phone Number',
        phonePlaceholder: '812-3456-7890',
        bio: 'Short Bio',
        bioPlaceholder: 'Tell us a little about yourself...',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        
        // Security
        changePassword: 'Change Password',
        changePasswordDesc: 'Manage your password and security settings to protect your financial data.',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        passwordMin: 'Min. 8 characters',
        passwordRepeat: 'Repeat password',
        passwordInfo: 'Make sure your new password is unique and not used for other accounts. Use a combination of uppercase, lowercase, numbers, and symbols.',
        updatePassword: 'Update Password',
        updating: 'Updating...',
        closeAccount: 'Close Account',
        closeAccountDesc: 'Deleting your account is permanent. All your transaction data, categories, and reports will be permanently deleted from our system.',
        deleteAccountBtn: 'Delete Pocket Account',
        
        // Preferences
        preferences: 'Preferences',
        preferencesDesc: 'Personalize your Pocket experience to your comfort.',
        displayMode: 'DISPLAY MODE',
        light: 'Light',
        lightDesc: 'Perfect for daytime use.',
        dark: 'Dark',
        darkDesc: 'Easy on the eyes in low light conditions.',
        languageRegion: 'LANGUAGE & REGION',
        primaryCurrency: 'PRIMARY CURRENCY',
        calendar: 'Calendar & Scheduling',
        calendarDesc: 'Set schedule and time format according to your preferences throughout the application.',
        
        // Day names
        daySun: 'Sun',
        dayMon: 'Mon',
        dayTue: 'Tue',
        dayWed: 'Wed',
        dayThu: 'Thu',
        dayFri: 'Fri',
        daySat: 'Sat',
        
        // Delete Modal
        deleteTitle: 'Delete Pocket Account?',
        deleteSubtitle: 'This action cannot be undone. All your data will be permanently deleted.',
        willBeDeleted: 'What will be deleted:',
        yourAccount: 'Your Account',
        allTransactions: 'All your transactions',
        walletsCategories: 'All wallets and categories',
        budgetGoals: 'Budgets and saving goals',
        reportsHistory: 'Reports and history',
        enterPassword: 'Enter Your Password to Confirm',
        cancel: 'Cancel',
        yesDelete: 'Yes, Delete Account',
        deleting: 'Deleting...',
        
        // Coming Soon
        comingSoon: 'COMING SOON',
        
        // Notifications
        notificationsTitle: 'Notifications',
        notificationsDesc: 'We are designing the perfect notification system for you',
        pushNotifications: 'Push Notifications',
        pushNotificationsDesc: 'Real-time alerts',
        smartAlerts: 'Smart Alerts',
        smartAlertsDesc: 'Budget warnings',
        customizable: 'Customizable',
        customizableDesc: 'Your preferences',
        
        // Data
        dataTitle: 'Data & Privacy',
        dataDesc: 'Powerful data management features are under development',
        exportData: 'Export Data',
        exportDataDesc: 'CSV & JSON format',
        privacyControl: 'Privacy Control',
        privacyControlDesc: 'Full data control',
        backupRestore: 'Backup & Restore',
        backupRestoreDesc: 'Never lose data',
      }
    };
    
    return translations[language]?.[key] || translations['id'][key] || key;
  };
  
  return t;
}
