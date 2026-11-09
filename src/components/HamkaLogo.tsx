import React, { useState } from 'react';

// =========================================================================
// PANDUAN MENGGANTI GAMBAR LOGO:
// 1. Jika Anda memiliki file gambar sendiri (misal: logo.png atau logo.jpg):
//    - Masukkan file tersebut ke folder /public/ (misal: /public/logo.png)
//    - Ubah konstanta CUSTOM_LOGO_URL di bawah menjadi: '/logo.png'
// 2. Atau masukkan tautan URL gambar langsung:
//    - Contoh: 'https://nama-website.com/gambar-logo.png'
// 3. Jika dibiarkan kosong (null), sistem otomatis memakai Logo Vektor SVG resmi.
// =========================================================================
export const CUSTOM_LOGO_URL: string | null = null; 

interface HamkaLogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'full';
  textColor?: string;
  imageSrc?: string; // Dapat dioper langsung dari props
}

export const HamkaLogo: React.FC<HamkaLogoProps> = ({
  className = '',
  size = 48,
  variant = 'emblem',
  textColor = 'text-slate-900',
  imageSrc,
}) => {
  const [imageError, setImageError] = useState(false);

  // Periksa apakah ada logo kustom dari prop, konstanta, atau localStorage
  const activeLogo =
    imageSrc ||
    CUSTOM_LOGO_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('hamka_custom_logo') : null);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Jika ada URL gambar dan gambar berhasil dimuat, tampilkan <img> */}
      {activeLogo && !imageError ? (
        <img
          src={activeLogo}
          alt="Logo HAMKA"
          width={size}
          height={size}
          onError={() => setImageError(true)}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="shrink-0 object-contain drop-shadow-sm select-none"
        />
      ) : (
        /* Default: Vektor SVG Logo Resmi HAMKA */
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-sm select-none"
        >
          {/* Lingkaran Luar */}
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0F2B48" strokeWidth="2.5" />

          {/* Gerigi Roda Gigi (Lambang Akademik) */}
          <g fill="#0F2B48">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              return (
                <rect
                  key={i}
                  x="47"
                  y="6"
                  width="6"
                  height="8"
                  rx="1.5"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
            <circle cx="50" cy="50" r="39" />
          </g>

          {/* Lingkaran Putih Tengah */}
          <circle cx="50" cy="50" r="35" fill="#FFFFFF" />

          {/* Pancaran Sinar Emas */}
          <g stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="22"
                  x2="50"
                  y2="28"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
          </g>
          <circle cx="50" cy="50" r="19" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.2" />

          {/* Simbol Buku Terbuka & Obor */}
          <g fill="#0F2B48">
            {/* Api Obor */}
            <path
              d="M50 34C48.5 37 46 38.5 48.5 41C50 42.5 50 43.5 50 44C50 43.5 50 42.5 51.5 41C54 38.5 51.5 37 50 34Z"
              fill="#EF4444"
            />
            {/* Gagang Obor */}
            <rect x="49" y="44" width="2" height="6" fill="#F59E0B" />

            {/* Sayap Buku Terbuka */}
            <path
              d="M50 52C45 49 39 49 36 50V58C39 57 45 57 50 60V52Z"
              fill="#0F2B48"
            />
            <path
              d="M50 52C55 49 61 49 64 50V58C61 57 55 57 50 60V52Z"
              fill="#0F2B48"
            />
            <line x1="50" y1="51" x2="50" y2="60" stroke="#FFFFFF" strokeWidth="1" />
          </g>

          {/* Pita Tulisan HAMKA */}
          <rect x="33" y="66" width="34" height="10" rx="3" fill="#0F2B48" />
          <text
            x="50"
            y="73.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="6.8"
            fontWeight="bold"
            letterSpacing="1"
            fontFamily="system-ui, sans-serif"
          >
            HAMKA
          </text>
        </svg>
      )}

      {/* Teks Brand (Hanya tampil jika variant = 'full') */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`text-base font-bold tracking-tight leading-tight ${textColor}`}>
            Absensi HAMKA
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            PORTAL KEHADIRAN DIGITAL
          </span>
        </div>
      )}
    </div>
  );
};
