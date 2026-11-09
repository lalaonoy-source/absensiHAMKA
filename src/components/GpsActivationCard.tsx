import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Laptop,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { LocationData } from '../types';

interface GpsActivationCardProps {
  location: LocationData | null;
  isDetecting: boolean;
  gpsError: string | null;
  onActivateGps: () => void;
  onSelectCampusFallback?: (campus: LocationData) => void;
}

export const GpsActivationCard: React.FC<GpsActivationCardProps> = ({
  location,
  isDetecting,
  gpsError,
  onActivateGps,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  // Determine status
  const isGpsActive = !!location && !gpsError;
  const isAccuracyGood = location && location.accuracy ? location.accuracy <= 30 : false;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isGpsActive
          ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-950'
          : gpsError
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-blue-50/80 border-blue-200/90 text-blue-950'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isGpsActive
                  ? 'bg-emerald-600 text-white'
                  : gpsError
                  ? 'bg-amber-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Fitur GPS & Lokasi Perangkat
                </span>
                {isGpsActive ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-200/80 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    GPS Aktif & Akurat
                  </span>
                ) : isDetecting ? (
                  <span className="inline-flex items-center gap-1 bg-blue-200/80 text-blue-900 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Mencari Titik GPS...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-200/90 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Wajib Diaktifkan
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guide toggle button */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cara Aktifkan GPS</span>
          </button>
        </div>

        {/* Content body */}
        {isGpsActive ? (
          /* Active GPS detail */
          <div className="space-y-2 pt-1">
            <div className="bg-white/90 rounded-lg p-2.5 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {location.locationName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>Lat: {location.latitude.toFixed(6)}</span>
                      <span>Lng: {location.longitude.toFixed(6)}</span>
                      {location.accuracy && (
                        <span
                          className={`font-semibold ${
                            isAccuracyGood ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          Akurasi GPS: ±{location.accuracy} meter
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {location.mapsUrl && (
                  <a
                    href={location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 border border-emerald-300 px-2 py-1 rounded transition shrink-0"
                  >
                    <span>Cek Peta</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-900">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Titik lokasi telah akurat dan siap dicap ke foto absensi.</span>
              </span>

              <button
                type="button"
                onClick={onActivateGps}
                disabled={isDetecting}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>Segarkan GPS</span>
              </button>
            </div>
          </div>
        ) : (
          /* Inactive / Error state */
          <div className="space-y-3 pt-1">
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {gpsError ||
                'Agar nama lokasi dan alamat presensi akurat, Anda harus mengaktifkan GPS / Layanan Lokasi pada perangkat masing-masing sebelum mengambil foto.'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onActivateGps}
                disabled={isDetecting}
                className="inline-flex items-center gap-2 bg-[#0f274a] hover:bg-[#163a69] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-70"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghubungkan ke GPS Perangkat...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-amber-300" />
                    <span>Nyalakan & Kunci GPS Akurat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                Petunjuk Mengaktifkan GPS
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Device Guide */}
        {showGuide && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/80 rounded-lg p-3 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Cara Mengaktifkan GPS / Lokasi di Perangkat Anda:
              </p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] leading-relaxed">
              {/* HP Android / iOS */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Di HP (Android / iPhone)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Usap layar dari atas (Control Center / Bar Notifikasi).</li>
                  <li>
                    Tekan ikon <strong>Lokasi / GPS</strong> agar berwarna aktif/biru.
                  </li>
                  <li>
                    Bila muncul pop-up izin browser, pilih <strong>"Saat aplikasi digunakan / Izinkan"</strong>.
                  </li>
                </ol>
              </div>

              {/* Laptop / PC */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Di Laptop / Komputer</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>
                    Buka <strong>Pengaturan Windows / Mac</strong> &rarr; Privasi &rarr; Nyalakan <strong>Location Services</strong>.
                  </li>
                  <li>
                    Pada bilah alamat browser, klik ikon gembok/setelan di kiri URL dan pastikan <strong>Location: Allow</strong>.
                  </li>
                  <li>Tekan tombol "Nyalakan & Kunci GPS Akurat" di atas.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
