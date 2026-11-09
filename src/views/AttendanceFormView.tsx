import React, { useState } from 'react';
import { Calendar, Lock, Send, ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { Department, AttendanceStatus, User, AttendanceRecord, LocationData } from '../types';

interface AttendanceFormViewProps {
  currentUser: User;
  onSubmit: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
}

const DEPARTMENTS: { label: string; value: Department }[] = [
  { label: 'Departemen organisasi', value: 'Departemen organisasi' },
  { label: 'Departemen penelitian dan pengembangan', value: 'departemen penelitian dan pengembangan' },
  { label: 'Departemen eksternal', value: 'departemen eksternal' },
  { label: 'Departemen komunikasi dan informasi', value: 'departemen komunikasi dan informasi' },
];

export const AttendanceFormView: React.FC<AttendanceFormViewProps> = ({
  currentUser,
  onSubmit,
}) => {
  // Form fields
  const [name, setName] = useState(currentUser.name || 'Ahmad Naufal');
  const [department, setDepartment] = useState<Department>('Departemen organisasi');
  
  // Format today's date for input YYYY-MM-DD
  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayIso);

  const [activityName, setActivityName] = useState('Rapat Koordinasi Departemen');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');

  // Camera photo (strictly live camera capture)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [capturedLocation, setCapturedLocation] = useState<LocationData | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Indonesian date formatter for greeting badge
  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama lengkap harus diisi.');
      return;
    }
    if (!activityName.trim()) {
      setFormError('Nama kegiatan harus diisi.');
      return;
    }
    if (!photoUrl) {
      setFormError('Wajib mengambil bukti foto langsung dengan kamera website terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({
        userId: currentUser.id,
        name: name.trim(),
        department: department,
        date: date,
        activityName: activityName.trim(),
        status: status,
        photoUrl: photoUrl,
        photoFileName: photoFileName || `bukti-kehadiran-${Date.now()}.jpg`,
        location: capturedLocation || undefined,
      });
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Title & Date Pill matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f274a] tracking-tight">
            Formulir absensi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Halo, <span className="font-semibold text-slate-800">{name}</span>. Lengkapi data kehadiran Anda untuk kegiatan hari ini.
          </p>
        </div>

        {/* Date pill on the right */}
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 shadow-sm text-xs text-slate-700 font-medium self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{formattedToday}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Form Left Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Data kehadiran
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              * Wajib diisi
            </span>
          </div>

          {formError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Nama & Departemen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition bg-white"
                />
              </div>

              {/* Departemen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Departemen <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition bg-white appearance-none cursor-pointer pr-8 capitalize"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Tanggal & Nama Kegiatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition bg-white pr-10"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Nama Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Contoh: Rapat Koordinasi Departemen"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a] transition bg-white"
                />
              </div>
            </div>

            {/* Row 3: Keterangan (Segmented Hadir / Sakit / Izin) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Keterangan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['Hadir', 'Sakit', 'Izin'] as AttendanceStatus[]).map((opt) => {
                  const isSelected = status === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStatus(opt)}
                      className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#0f274a] shadow-sm border border-slate-200/90 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          opt === 'Hadir'
                            ? 'bg-emerald-500'
                            : opt === 'Sakit'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Bukti Foto (Strictly Live Camera Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Bukti Foto <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  KAMERA LANGSUNG RESMI
                </span>
              </div>

              {/* Strict Live Camera Capture Component with GPS Location */}
              <CameraCapture
                photoUrl={photoUrl}
                capturedLocation={capturedLocation}
                onPhotoCaptured={(dataUrl, fileName, loc) => {
                  setPhotoUrl(dataUrl);
                  setPhotoFileName(fileName);
                  setCapturedLocation(loc);
                  setFormError(null);
                }}
                onResetPhoto={() => {
                  setPhotoUrl(null);
                  setPhotoFileName('');
                  setCapturedLocation(null);
                }}
                onUpdateLocation={(loc) => {
                  setCapturedLocation(loc);
                }}
              />
            </div>

            {/* Bottom Footer Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Data Anda tersimpan dengan aman.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f274a] hover:bg-[#163a69] text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Mengirim data...' : 'Kirim absensi'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Information Sidebar Column (4 cols) matching screenshot */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Navy Card: "Sebelum mengirim" */}
          <div className="bg-[#0f274a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="text-[11px] font-semibold text-blue-200 tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-300" />
              Sebelum mengirim
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <p className="font-semibold text-white">Pastikan data Anda</p>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Pastikan nama, departemen, dan tanggal sudah sesuai kegiatan yang dihadiri.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="font-semibold text-white">Pilih keterangan</p>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Pilih Hadir, Sakit, atau Izin sesuai kondisi Anda hari ini.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="font-semibold text-white">Aktifkan GPS Perangkat</p>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Nyalakan fitur Lokasi/GPS pada HP/Laptop Anda agar nama lokasi dan alamat kehadiran tercatat akurat.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="font-semibold text-white">Sertakan bukti foto</p>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Ambil foto langsung yang jelas menggunakan kamera website sebagai bukti pendukung sah.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Cream Card: "Satu kegiatan, satu absensi" */}
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                !
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Satu kegiatan, satu absensi
                </h4>
                <p className="text-[11px] text-amber-800/90 leading-relaxed mt-1">
                  Periksa kembali seluruh data. Kirim absensi hanya sekali untuk kegiatan yang sama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
