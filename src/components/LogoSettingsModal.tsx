import React, { useState } from 'react';
import { Image, X, Check, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { HamkaLogo } from './HamkaLogo';

interface LogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoSettingsModal: React.FC<LogoSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logoInput, setLogoInput] = useState(() => {
    return localStorage.getItem('hamka_custom_logo') || '';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoInput.trim()) {
      localStorage.setItem('hamka_custom_logo', logoInput.trim());
    } else {
      localStorage.removeItem('hamka_custom_logo');
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      window.location.reload(); // Refresh to apply across the whole app
    }, 600);
  };

  const handleReset = () => {
    localStorage.removeItem('hamka_custom_logo');
    setLogoInput('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      window.location.reload();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoInput(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Ganti Gambar Logo HAMKA</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs text-slate-600">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Logo berhasil diperbarui! Memuat ulang tampilan...</span>
            </div>
          )}

          {/* Current Logo Preview */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 mb-2">
              Pratinjau Logo Saat Ini:
            </span>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <HamkaLogo size={70} variant="full" imageSrc={logoInput || undefined} />
            </div>
          </div>

          {/* Option A: Upload from Computer */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Pilih Gambar dari Komputer:
            </label>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition bg-white text-slate-700 font-medium">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Pilih file gambar (.png, .jpg, .svg)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option B: Enter URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Atau Masukkan Tautan / URL Gambar:
            </label>
            <input
              type="text"
              value={logoInput.startsWith('data:') ? '[File Gambar Lokal]' : logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              placeholder="Contoh: https://link-gambar.com/logo.png atau /logo.png"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f274a]/20 focus:border-[#0f274a]"
            />
          </div>

          {/* Code guide callout */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
            <p className="font-bold mb-0.5">Lokasi File Kodingan Logo:</p>
            <p>
              Buka berkas <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-800">src/components/HamkaLogo.tsx</code> lalu ubah baris:
            </p>
            <code className="block bg-slate-900 text-emerald-400 p-2 rounded mt-1.5 font-mono text-[10px]">
              export const CUSTOM_LOGO_URL = '/logo.png';
            </code>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 rounded"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Logo Default</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0f274a] hover:bg-[#163a69] text-white rounded-lg font-semibold shadow transition"
              >
                Terapkan Logo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
