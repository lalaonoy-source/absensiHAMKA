import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-5 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-slate-500">
          © 2026 HAMKA. Seluruh hak cipta dilindungi.
        </p>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">Kebijakan privasi</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Layanan aktif
          </span>
        </div>
      </div>
    </footer>
  );
};
