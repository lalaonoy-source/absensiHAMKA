import React, { useState } from 'react';
import { User, Lock, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { HamkaLogo } from '../components/HamkaLogo';
import { StorageService } from '../services/storage';
import { User as UserType } from '../types';

interface AuthViewProps {
  onSuccess: (user: UserType) => void;
  onBackToWelcome: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onBackToWelcome }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state
  const [loginName, setLoginName] = useState('Ahmad Naufal');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotPhone, setForgotPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear notifications on mode switch
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = StorageService.loginUser(loginName, loginPassword);
    if (!res.success || !res.user) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg('Login berhasil. Mengarahkan ke formulir absensi...');
    setTimeout(() => {
      onSuccess(res.user!);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak sesuai dengan password.');
      return;
    }

    const res = StorageService.registerUser(regName, regPhone, regPassword);
    if (!res.success || !res.user) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg('Akun berhasil didaftarkan! Mengarahkan ke formulir absensi...');
    setTimeout(() => {
      onSuccess(res.user!);
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi password baru tidak sesuai.');
      return;
    }

    const res = StorageService.resetPasswordByPhone(forgotPhone, newPassword);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    // Fill login with the phone or let them log in
    setLoginName(forgotPhone);
    setLoginPassword(newPassword);

    setTimeout(() => {
      setMode('login');
      setSuccessMsg('Silakan masuk dengan password baru yang telah dibuat.');
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onBackToWelcome}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Utama</span>
        </button>
      </div>

      {/* Main Split Card matching screenshot */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Navy Column */}
        <div className="md:col-span-5 bg-[#0f274a] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Small emblem card */}
            <div className="inline-block bg-white p-3 rounded-xl shadow-md mb-6">
              <HamkaLogo size={44} variant="emblem" />
            </div>

            {/* Tag */}
            <div className="text-[11px] font-semibold text-blue-200/90 tracking-widest uppercase mb-1">
              SATU AKUN, SATU LANGKAH
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {mode === 'login'
                ? 'Selamat datang kembali.'
                : mode === 'register'
                ? 'Bergabung bersama HAMKA.'
                : 'Pusat Pemulihan Akun.'}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {mode === 'login'
                ? 'Masuk ke akun Anda untuk mencatat kehadiran kegiatan di HAMKA secara akurat dan tepat waktu.'
                : mode === 'register'
                ? 'Daftarkan nama dan nomor telepon Anda untuk kemudahan akses presensi kegiatan harian.'
                : 'Atur ulang kata sandi akun Anda menggunakan nomor telepon yang telah terdaftar.'}
            </p>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-8 border-t border-white/10 mt-6 flex items-start gap-2.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Jaga kerahasiaan akun Anda. Jangan bagikan password kepada siapa pun.
            </span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                  AKSES AKUN
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Masuk ke akun Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Silakan isi nama dan password yang terdaftar.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Nama Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#0f274a] focus:ring-[#0f274a] w-3.5 h-3.5"
                    />
                    <span>Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    className="font-medium text-slate-600 hover:text-[#0f274a] hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-[#0f274a] hover:bg-[#163a69] text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Registration Option */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-[#0f274a] hover:underline cursor-pointer"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTER (DAFTAR) */}
          {mode === 'register' && (
            <div>
              <div className="mb-5">
                <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  REGISTRASI AKUN
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Daftar Akun HAMKA
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lengkapi data diri Anda untuk membuat akun presensi baru.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Nama */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Ahmad Naufal"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <div className="absolute right-3 top-2 text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* No Telepon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No Telepon
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition font-mono"
                    />
                    <div className="absolute right-3 top-2 text-slate-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi password di atas"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <div className="absolute right-3 top-2 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-[#0f274a] hover:bg-[#163a69] text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Lupa password link under Register as explicitly requested */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('forgot_password')}
                  className="text-amber-700 hover:text-amber-800 font-medium hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lupa password? Reset atau buat ulang di sini</span>
                </button>

                <p className="text-slate-500 mt-1">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#0f274a] hover:underline"
                  >
                    Masuk ke akun
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: FORGOT PASSWORD (LUPA PASSWORD DENGAN NO TELEPON) */}
          {mode === 'forgot_password' && (
            <div>
              <div className="mb-5">
                <span className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                  RESET PASSWORD
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Atur Ulang Password
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan nomor telepon yang terdaftar untuk membuat ulang password Anda.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {/* No Telepon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon Terdaftar
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition font-mono"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Gunakan nomor HP yang digunakan saat registrasi akun HAMKA.
                  </span>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Ketik ulang password baru"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Submit Reset */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Simpan Password Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-[#0f274a] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke halaman login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
