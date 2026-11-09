import React from 'react';
import { ArrowRight, UserCheck, FileEdit, CheckCheck, ShieldCheck } from 'lucide-react';
import { HamkaLogo } from '../components/HamkaLogo';

interface WelcomeViewProps {
  onStart: () => void;
  isLoggedIn: boolean;
  userName?: string;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStart,
  isLoggedIn,
  userName,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Hero Text & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0f274a] text-xs font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0f274a]" />
            SELAMAT DATANG DI HAMKA
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f274a] tracking-tight leading-[1.15]">
            Setiap kehadiran, <br className="hidden sm:inline" />
            bagian dari kontribusi.
          </h1>

          {/* Subtext description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Catat kehadiran kegiatan Anda dengan mudah dan tertib. Masuk,
            lengkapi formulir, lalu kirim absensi dalam satu alur sederhana.
          </p>

          {/* Call to Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={onStart}
              type="button"
              className="inline-flex items-center gap-2.5 bg-[#0f274a] hover:bg-[#163a69] text-white font-medium text-sm sm:text-base px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoggedIn ? `Lanjut Absensi (${userName})` : 'Mulai absensi'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Gunakan akun HAMKA Anda untuk melanjutkan.
          </p>

          {/* 3 Step Mini-Cards at Bottom */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80 w-full">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[#0f274a]">01</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                Masuk ke akun
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Identitas terdaftar</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[#0f274a]">02</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                Lengkapi data
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Departemen & kegiatan</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[#0f274a]">03</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                Kirim kehadiran
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Foto kamera langsung</span>
            </div>
          </div>
        </div>

        {/* Right Column: Navy Banner Card matching screenshot */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f274a] p-6 sm:p-8 shadow-xl flex flex-col items-center justify-between min-h-[380px] text-center relative overflow-hidden">
            {/* Subtle light accent curve in card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top spacer or subtle bar */}
            <div className="w-8 h-1 bg-white/20 rounded-full mb-4" />

            {/* Inner White Emblem Card */}
            <div className="w-full bg-white rounded-xl py-8 px-6 shadow-md flex flex-col items-center justify-center space-y-3">
              <HamkaLogo size={88} variant="emblem" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-xl font-bold tracking-wider text-[#0f274a]">
                  HAMKA
                </span>
                <span className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase mt-0.5">
                  Portal Kehadiran Digital
                </span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="mt-6 text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
              <p className="font-medium text-white">Kehadiran tercatat.</p>
              <p className="text-slate-300">Kontribusi Anda berarti.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
