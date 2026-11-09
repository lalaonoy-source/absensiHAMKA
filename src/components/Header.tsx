import React, { useState } from 'react';
import { HelpCircle, Globe, History, Database, LogOut, ChevronDown } from 'lucide-react';
import { HamkaLogo } from './HamkaLogo';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenHistory: () => void;
  onOpenDatabaseDocs: () => void;
  onOpenHelp: () => void;
  onOpenLogoSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenHistory,
  onOpenDatabaseDocs,
  onOpenHelp,
  onOpenLogoSettings,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo + Ganti Logo Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <HamkaLogo size={38} variant="full" textColor="text-[#0f274a]" />
          </div>

          <button
            type="button"
            onClick={onOpenLogoSettings}
            className="text-[10px] font-medium text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 px-2 py-0.5 rounded transition hidden sm:inline-flex items-center gap-1"
            title="Klik untuk mengganti gambar logo"
          >
            <span>Ubah Logo</span>
          </button>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Riwayat Absensi Shortcut */}
          <button
            onClick={onOpenHistory}
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0f274a] bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
            title="Lihat riwayat kehadiran"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Riwayat Absensi</span>
          </button>

          {/* Database & PHP Code Shortcut */}
          <button
            onClick={onOpenDatabaseDocs}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f274a] bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 px-3 py-1.5 rounded-lg transition"
            title="Lihat struktur database phpMyAdmin dan codingan PHP"
          >
            <Database className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Database & PHP</span>
            <span className="sm:hidden">PHP/DB</span>
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            type="button"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Butuh bantuan?</span>
          </button>

          {/* Logged In User Pill or Guest info */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 px-2.5 rounded-full transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#0f274a] text-white flex items-center justify-center font-bold text-[10px]">
                  {getInitials(currentUser.name)}
                </div>
                <span className="max-w-[110px] truncate text-slate-800 font-semibold">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{currentUser.phone}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Riwayat Kehadiran Saya
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar dari Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 border-l border-slate-200 pl-3">
              <Globe className="w-3.5 h-3.5" />
              <span>ID | Indonesia</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
