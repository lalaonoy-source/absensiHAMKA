import React from 'react';
import { Check, CheckCircle2, History, RotateCcw, ExternalLink, MapPin } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface SuccessViewProps {
  record: AttendanceRecord;
  onFinish: () => void;
  onOpenHistory: () => void;
  onNewAttendance: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  record,
  onFinish,
  onOpenHistory,
  onNewAttendance,
}) => {
  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Center White Card matching screenshot */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-center flex flex-col items-center">
        {/* Large Green Check Circle Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Uppercase Subtitle */}
        <span className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase">
          ABSENSI BERHASIL DIKIRIM
        </span>

        {/* Big Headline */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2 tracking-tight">
          Anda sudah absensi
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          Terima kasih, <span className="font-semibold text-slate-800">{record.name}</span>. Kehadiran Anda telah tercatat ke dalam sistem. Berikut ringkasan absensi yang Anda kirim:
        </p>

        {/* Ringkasan Kehadiran Box */}
        <div className="w-full bg-slate-50/80 rounded-xl border border-slate-200/90 p-5 text-left mb-6 relative">
          {/* Status Badge in Top Right */}
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                record.status === 'Hadir'
                  ? 'bg-emerald-100 text-emerald-800'
                  : record.status === 'Sakit'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  record.status === 'Hadir'
                    ? 'bg-emerald-600'
                    : record.status === 'Sakit'
                    ? 'bg-amber-600'
                    : 'bg-blue-600'
                }`}
              />
              {record.status}
            </span>
          </div>

          <h4 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">
            Ringkasan kehadiran
          </h4>

          {/* Details list */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-1">
              <span className="text-slate-500">Nama</span>
              <span className="font-semibold text-slate-900">{record.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-1">
              <span className="text-slate-500">Departemen</span>
              <span className="font-semibold text-slate-900 capitalize">{record.department}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-1">
              <span className="text-slate-500">Tanggal</span>
              <span className="font-semibold text-slate-900">{formatDateDisplay(record.date)}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-1">
              <span className="text-slate-500">Nama kegiatan</span>
              <span className="font-semibold text-slate-900">{record.activityName}</span>
            </div>

            {/* Location row */}
            {record.location && (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-2 border-b border-slate-200/60 gap-1">
                <span className="text-slate-500 flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lokasi Presensi</span>
                </span>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {record.location.locationName}
                  </p>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>
                      {record.location.latitude.toFixed(5)}, {record.location.longitude.toFixed(5)}
                    </span>
                    {record.location.mapsUrl && (
                      <a
                        href={record.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5 font-sans"
                      >
                        <span>Peta</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-2">
              <span className="text-slate-500">Bukti foto</span>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-md overflow-hidden border border-slate-300 shrink-0 bg-slate-900">
                  <img
                    src={record.photoUrl}
                    alt="Bukti"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-xs text-blue-600 truncate max-w-[180px]">
                  {record.photoFileName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Selesai */}
        <button
          type="button"
          onClick={onFinish}
          className="w-full bg-[#0f274a] hover:bg-[#163a69] text-white font-medium text-sm sm:text-base py-3 px-6 rounded-lg shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Selesai</span>
          <Check className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Subtext */}
        <p className="text-xs text-slate-400 mt-3">
          Anda dapat menutup halaman ini setelah selesai.
        </p>

        {/* Secondary Options */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold hover:underline"
          >
            <History className="w-3.5 h-3.5" />
            <span>Lihat Riwayat Absensi Lengkap</span>
          </button>

          <span className="text-slate-300">•</span>

          <button
            type="button"
            onClick={onNewAttendance}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Isi Absensi Kegiatan Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
