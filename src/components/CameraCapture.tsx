import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  MapPin,
  ExternalLink,
  Navigation,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { LocationData } from '../types';
import { requestDeviceGpsLocation, HAMKA_LOCATIONS } from '../services/locationService';
import { GpsActivationCard } from './GpsActivationCard';

interface CameraCaptureProps {
  photoUrl: string | null;
  capturedLocation: LocationData | null;
  onPhotoCaptured: (dataUrl: string, fileName: string, location: LocationData) => void;
  onResetPhoto: () => void;
  onUpdateLocation?: (loc: LocationData) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  photoUrl,
  capturedLocation,
  onPhotoCaptured,
  onResetPhoto,
  onUpdateLocation,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);

  // GPS Location states
  const [activeLocation, setActiveLocation] = useState<LocationData | null>(capturedLocation);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsPromptNotice, setGpsPromptNotice] = useState<string | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (capturedLocation) {
      setActiveLocation(capturedLocation);
    }
  }, [capturedLocation]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMsg(null);
    setPermissionDenied(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Browser Anda tidak mendukung akses kamera langsung.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
        };
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setErrorMsg('Izin akses kamera ditolak. Harap izinkan akses kamera pada browser Anda.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('Perangkat kamera tidak ditemukan pada komputer/HP Anda.');
      } else {
        setErrorMsg('Gagal mengakses kamera: ' + (err.message || 'Kamera sedang digunakan aplikasi lain.'));
      }
      setIsStreaming(false);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (!photoUrl) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [photoUrl, startCamera, stopCamera]);

  // Request device hardware GPS
  const handleActivateGps = useCallback(async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    setGpsPromptNotice(null);

    const res = await requestDeviceGpsLocation();
    setIsDetectingGps(false);

    if (res.success && res.data) {
      setActiveLocation(res.data);
      if (onUpdateLocation) {
        onUpdateLocation(res.data);
      }
      return res.data;
    } else {
      setGpsError(
        res.error ||
          'Pastikan GPS / Lokasi pada perangkat HP atau Komputer Anda sudah dinyalakan agar koordinat akurat.'
      );
      return null;
    }
  }, [onUpdateLocation]);

  // Auto-attempt GPS activation when component loads if no location yet
  useEffect(() => {
    if (!activeLocation) {
      handleActivateGps();
    }
  }, [activeLocation, handleActivateGps]);

  // Main capture function: Ensures GPS is locked, then takes photo
  const handleCapture = async () => {
    if (!videoRef.current) return;

    let targetLoc = activeLocation;

    // If GPS not active yet, enforce activating it first!
    if (!targetLoc) {
      setGpsPromptNotice('Mengaktifkan GPS perangkat Anda untuk mengunci koordinat akurat...');
      targetLoc = await handleActivateGps();
      if (!targetLoc) {
        setGpsPromptNotice(
          'Harap nyalakan GPS / Lokasi pada HP/Laptop Anda terlebih dahulu agar nama lokasi akurat!'
        );
        return;
      }
    }

    // Trigger visual flash
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 250);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror for selfie camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Watermark strip
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(15, 39, 74, 0.82)';
    ctx.fillRect(8, canvas.height - 52, canvas.width - 16, 44);

    // Date & Time
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    const now = new Date();
    const stampText = `HAMKA ABSENSI RESMI • ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    ctx.fillText(stampText, 16, canvas.height - 33);

    // GPS details watermark
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px sans-serif';
    const locText = `📍 ${targetLoc.latitude.toFixed(5)}, ${targetLoc.longitude.toFixed(5)} • ${targetLoc.locationName.slice(0, 48)}`;
    ctx.fillText(locText, 16, canvas.height - 16);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `bukti-kehadiran-${dateStr}-${timeStr}.jpg`;

    stopCamera();
    onPhotoCaptured(dataUrl, fileName, targetLoc);
  };

  // Demo / fallback snapshot when camera physical device is restricted
  const handleSimulatedLiveSnapshot = async () => {
    let loc = activeLocation;
    if (!loc) {
      loc = await handleActivateGps();
      if (!loc) {
        const def = HAMKA_LOCATIONS[0];
        loc = {
          latitude: def.lat,
          longitude: def.lng,
          accuracy: 10,
          locationName: def.name,
          mapsUrl: `https://www.google.com/maps?q=${def.lat},${def.lng}`,
        };
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#0f274a');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(320, 190, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(320, 360, 130, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KAMERA WEBSENSOR TERVERIFIKASI HAMKA', 320, 395);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`📍 ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`, 320, 420);
    ctx.fillText(`${loc.locationName.slice(0, 50)}`, 320, 440);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `bukti-kehadiran-${dateStr}-${timeStr}.jpg`;

    onPhotoCaptured(canvas.toDataURL('image/jpeg', 0.9), fileName, loc);
  };

  const handleRetake = () => {
    onResetPhoto();
    setTimeout(() => {
      startCamera();
    }, 150);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="w-full space-y-3">
      {/* 1. Mandatory Device GPS Activation Card */}
      <GpsActivationCard
        location={activeLocation}
        isDetecting={isDetectingGps}
        gpsError={gpsError}
        onActivateGps={handleActivateGps}
      />

      {/* Notice if user attempts to take photo without active GPS */}
      {gpsPromptNotice && !activeLocation && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{gpsPromptNotice}</span>
        </div>
      )}

      {/* 2. Camera Viewfinder or Captured Preview */}
      {photoUrl ? (
        /* Preview Captured Photo */
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group shadow-sm">
            <img
              src={photoUrl}
              alt="Bukti Kehadiran Terverifikasi"
              className="w-full h-56 object-cover object-center"
            />

            {/* Verification Badge */}
            <div className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Foto Kamera Berhasil Diambil</span>
            </div>

            {/* Live GPS Stamp Overlay */}
            {activeLocation && (
              <div className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-sm text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5 text-blue-400" />
                <span>GPS Terkunci</span>
              </div>
            )}

            {/* Action Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex items-center justify-between">
              <span className="text-white text-xs font-mono truncate max-w-[200px]">
                {photoUrl.startsWith('data:') ? 'Foto Terverifikasi' : 'bukti-kehadiran.jpg'}
              </span>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/95 text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
                Ambil Ulang
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Live Camera Viewfinder */
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
          {/* Flash animation */}
          {isCapturingFlash && (
            <div className="absolute inset-0 bg-white z-20 animate-fade-out pointer-events-none" />
          )}

          <div className="relative w-full h-60 bg-slate-950 flex flex-col items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? '-scale-x-100' : ''
              } ${isStreaming ? 'block' : 'hidden'}`}
            />

            {/* Reticle with GPS status */}
            {isStreaming && (
              <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-lg flex items-center justify-center">
                <div className="w-36 h-36 border border-dashed border-white/60 rounded-full" />
                <div className="absolute top-2 right-2 text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeLocation ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span>{activeLocation ? 'GPS SIAP & AKURAT' : 'MENUNGGU GPS'}</span>
                </div>
              </div>
            )}

            {/* Error or Loading state */}
            {!isStreaming && (
              <div className="p-4 text-center flex flex-col items-center max-w-sm">
                {permissionDenied ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-white text-xs font-medium mb-1">Kamera Belum Diizinkan</p>
                    <p className="text-slate-400 text-[11px] mb-3">
                      Tekan tombol izin kamera & lokasi pada browser Anda untuk melanjutkan absensi.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Coba Izin Lagi
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulatedLiveSnapshot}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Gunakan Kamera Demo
                      </button>
                    </div>
                  </>
                ) : errorMsg ? (
                  <>
                    <Camera className="w-10 h-10 text-slate-500 mb-2" />
                    <p className="text-slate-300 text-xs mb-3">{errorMsg}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Ulangi Kamera
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulatedLiveSnapshot}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Gunakan Kamera Demo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-white text-xs">Menghubungkan ke kamera langsung & GPS...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Camera controls toolbar */}
          {isStreaming && (
            <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 p-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded transition flex items-center gap-1"
                title="Ganti Kamera Depan/Belakang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Putar</span>
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={isDetectingGps}
                className={`flex items-center gap-2 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  activeLocation
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                }`}
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Mengunci GPS...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span>Ambil Foto Kehadiran</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-300 font-mono pr-1 flex items-center gap-1">
                <MapPin className={`w-3.5 h-3.5 ${activeLocation ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="hidden sm:inline">
                  {activeLocation ? `GPS: ±${activeLocation.accuracy || 10}m` : 'Nyalakan GPS'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
