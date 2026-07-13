'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  ArrowLeftRight, 
  FolderOpen, 
  PiggyBank, 
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Lock,
  Bell,
  Database
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { translate } from '@/lib/translations';

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, updateTrigger } = usePreferences();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const currentTab = searchParams.get('tab') || 'profile';

  // Navigation with translations - will update when language changes
  const navigation = [
    { name: translate('nav.dashboard', language), href: '/dashboard', icon: Home },
    { name: translate('nav.transactions', language), href: '/dashboard/transactions', icon: ArrowLeftRight },
    { name: translate('nav.wallets', language), href: '/dashboard/wallets', icon: Wallet },
    { name: translate('nav.categories', language), href: '/dashboard/categories', icon: FolderOpen },
    { name: translate('nav.budget', language), href: '/dashboard/budget', icon: PiggyBank },
    { name: translate('nav.reports', language), href: '/dashboard/reports', icon: BarChart3 },
  ];

  const settingsNavigation = [
    { name: translate('settings.profile', language), href: '/dashboard/settings?tab=profile', icon: Settings, tab: 'profile' },
    { name: translate('settings.security', language), href: '/dashboard/settings?tab=security', icon: Settings, tab: 'security' },
    { name: translate('settings.preferences', language), href: '/dashboard/settings?tab=preferences', icon: Settings, tab: 'preferences' },
    { name: translate('settings.notifications', language), href: '/dashboard/settings?tab=notifications', icon: Settings, tab: 'notifications' },
    { name: translate('settings.data', language), href: '/dashboard/settings?tab=data', icon: Settings, tab: 'data' },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 
        bg-gradient-to-br from-white via-slate-50 to-blue-50
        dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
        transform transition-transform duration-300 ease-in-out
        border-r border-slate-200/50 dark:border-slate-700/50
        shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        
        {/* Animated floating orbs */}
        <div className="absolute top-20 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 left-4 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="h-full flex flex-col relative z-10">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 relative">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <img 
                  src="/logo.png" 
                  alt="Pocket Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Pocket
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/30 scale-105' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md hover:scale-105 hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {/* Hover gradient background */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300" />
                      )}
                      
                      <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className={`relative z-10 transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium group-hover:font-semibold'}`}>
                        {item.name}
                      </span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* PENGATURAN Section */}
            <div className="mt-8 mb-3 px-4">
              <div className="flex items-center space-x-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {language === 'en' ? 'SETTINGS' : 'PENGATURAN'}
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
              </div>
            </div>

            <ul className="space-y-2">
              {settingsNavigation.map((item, index) => {
                const IconComponent = item.tab === 'profile' ? User 
                  : item.tab === 'security' ? Lock
                  : item.tab === 'preferences' ? Settings
                  : item.tab === 'notifications' ? Bell
                  : Database;
                
                const isActive = pathname === '/dashboard/settings' && currentTab === item.tab;
                
                return (
                  <li key={item.name}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(navigation.length + index) * 50}ms` }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/30 scale-105' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md hover:scale-105 hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {/* Hover gradient background */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300" />
                      )}
                      
                      <IconComponent className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className={`relative z-10 transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium group-hover:font-semibold'}`}>
                        {item.name}
                      </span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden"
            >
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-rose-500/0 group-hover:from-red-500/10 group-hover:to-rose-500/10 transition-all duration-300" />
              
              <LogOut className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium relative z-10 group-hover:font-semibold transition-all duration-300">
                {translate('nav.logout', language)}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="h-full flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Pocket Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Pocket</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
