import React, { useState, useMemo } from 'react';
import { History, Search, Filter, Calendar, CheckCircle2, AlertCircle, X, Download, Eye, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Department } from '../types';
import { StorageService } from '../services/storage';

interface HistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewAttendance: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  isOpen,
  onClose,
  onSelectNewAttendance,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    StorageService.getAttendanceRecords()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [previewPhoto, setPreviewPhoto] = useState<AttendanceRecord | null>(null);

  // Refresh records when opened
  React.useEffect(() => {
    if (isOpen) {
      setRecords(StorageService.getAttendanceRecords());
    }
  }, [isOpen]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.location?.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchStatus =
        selectedStatus === 'all' || rec.status === selectedStatus;

      const matchDept =
        selectedDept === 'all' || rec.department.toLowerCase() === selectedDept.toLowerCase();

      return matchSearch && matchStatus && matchDept;
    });
  }, [records, searchQuery, selectedStatus, selectedDept]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const hadir = records.filter((r) => r.status === 'Hadir').length;
    const sakit = records.filter((r) => r.status === 'Sakit').length;
    const izin = records.filter((r) => r.status === 'Izin').length;
    const percentHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, sakit, izin, percentHadir };
  }, [records]);

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Departemen', 'Tanggal', 'Kegiatan', 'Status', 'Lokasi', 'File Foto', 'Waktu Dibuat'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.name}"`,
      `"${r.department}"`,
      r.date,
      `"${r.activityName}"`,
      r.status,
      `"${r.location?.locationName || '-'}"`,
      `"${r.photoFileName}"`,
      r.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-absensi-hamka-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f274a] text-white flex items-center justify-center shadow-sm">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Riwayat Absensi Kehadiran HAMKA
              </h3>
              <p className="text-xs text-slate-500">
                Catatan kehadiran harian seluruh anggota dan pengurus kegiatan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition"
              title="Ekspor data kehadiran ke CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Total Absensi</span>
              <p className="text-xl font-extrabold text-[#0f274a] mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/70">
              <span className="text-[11px] font-medium text-emerald-700">Hadir</span>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{stats.hadir}</p>
                <span className="text-xs font-semibold text-emerald-600">({stats.percentHadir}%)</span>
              </div>
            </div>
            <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/70">
              <span className="text-[11px] font-medium text-amber-700">Sakit</span>
              <p className="text-xl font-extrabold text-amber-800 mt-0.5">{stats.sakit}</p>
            </div>
            <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/70">
              <span className="text-[11px] font-medium text-blue-700">Izin</span>
              <p className="text-xl font-extrabold text-blue-800 mt-0.5">{stats.izin}</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, kegiatan, atau departemen..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a]"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none max-w-[160px] truncate"
              >
                <option value="all">Semua Departemen</option>
                <option value="Departemen organisasi">Organisasi</option>
                <option value="departemen penelitian dan pengembangan">Litbang</option>
                <option value="departemen eksternal">Eksternal</option>
                <option value="departemen komunikasi dan informasi">Kominfo</option>
              </select>
            </div>
          </div>

          {/* Table / List of records */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-sm">Tidak ada data absensi yang sesuai filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedDept('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Departemen</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kegiatan</th>
                    <th className="py-3 px-4">Lokasi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Foto Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {rec.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {rec.department}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {formatDateDisplay(rec.date)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[180px] truncate">
                        {rec.activityName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                        {rec.location ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="truncate block font-medium text-[11px] text-slate-800" title={rec.location.locationName}>
                                {rec.location.locationName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {rec.location.latitude.toFixed(4)}, {rec.location.longitude.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Sakit'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === 'Hadir'
                                ? 'bg-emerald-600'
                                : rec.status === 'Sakit'
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}
                          />
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(rec)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Foto</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Menampilkan {filteredRecords.length} dari {records.length} data absensi
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectNewAttendance();
              }}
              className="text-xs font-semibold bg-[#0f274a] text-white hover:bg-[#163a69] px-4 py-2 rounded-lg transition"
            >
              + Buat Absensi Baru
            </button>
          </div>
        </div>
      </div>

      {/* Photo Preview Sub-Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-950 flex items-center justify-center">
              <img
                src={previewPhoto.photoUrl}
                alt="Foto Bukti Kehadiran"
                className="w-full max-h-[360px] object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-white text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>{previewPhoto.name}</span>
                <span className="text-emerald-600">{previewPhoto.status}</span>
              </div>
              <p className="text-slate-600">{previewPhoto.activityName}</p>
              <p className="text-slate-400 capitalize">{previewPhoto.department} • {formatDateDisplay(previewPhoto.date)}</p>

              {/* Location details */}
              {previewPhoto.location && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-start justify-between gap-2 bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                        {previewPhoto.location.locationName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Lat: {previewPhoto.location.latitude.toFixed(5)}, Lng: {previewPhoto.location.longitude.toFixed(5)}
                      </p>
                    </div>
                  </div>
                  {previewPhoto.location.mapsUrl && (
                    <a
                      href={previewPhoto.location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 shrink-0 p-1 bg-white border border-slate-200 rounded text-[10px] flex items-center gap-1 font-medium"
                      title="Buka di Google Maps"
                    >
                      <span>Peta</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>Bukti: {previewPhoto.photoFileName}</span>
                <span className="text-emerald-600">✓ GPS Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
