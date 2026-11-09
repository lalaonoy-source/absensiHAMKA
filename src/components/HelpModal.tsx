import React from 'react';
import { HelpCircle, X, ShieldAlert, Phone, Mail, Camera, FileCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Pusat Bantuan & Petunjuk Absensi</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
              <Camera className="w-4 h-4 text-blue-700" />
              Ketentuan Bukti Foto Kamera Langsung
            </h4>
            <p className="text-blue-800 text-[11px]">
              Sesuai peraturan tata tertib HAMKA, bukti foto kehadiran hanya dapat diambil secara langsung melalui kamera peramban (webcam/kamera HP) pada saat mengisi formulir. Pengunggahan berkas foto dari memori/galeri tidak diizinkan demi validitas presensi.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-[#0f274a] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Alur Pengisian</p>
                <p className="text-[11px] text-slate-500">
                  Masuk akun &rarr; Lengkapi data (Nama, Departemen, Kegiatan, Keterangan) &rarr; Ambil Foto Kamera &rarr; Tekan Kirim Absensi &rarr; Selesai.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Lupa Password Akun?</p>
                <p className="text-[11px] text-slate-500">
                  Gunakan fitur "Lupa Password" pada menu masuk atau di bawah form daftar, lalu masukkan nomor telepon yang Anda daftarkan untuk membuat ulang kata sandi.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="font-bold text-slate-800 mb-2">Kontak Layanan Administrasi HAMKA:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>helpdesk@hamka.ac.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs bg-[#0f274a] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#163a69] transition"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
