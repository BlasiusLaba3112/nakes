import React from 'react';
import {
  Activity,
  Database,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  PlusCircle,
  Send,
  UserCheck,
  Users,
} from 'lucide-react';
import { NURSE_PROFILE } from '../utils/whatsapp';

interface NavbarProps {
  activeTab: 'dashboard' | 'master-data' | 'spm-kesehatan' | 'pelaporan';
  setActiveTab: (tab: 'dashboard' | 'master-data' | 'spm-kesehatan' | 'pelaporan') => void;
  onOpenAddModal: () => void;
  onOpenNurseProfile: () => void;
  onOpenExportImport: () => void;
  totalKK: number;
  totalJiwa: number;
  nurseAvatar?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenNurseProfile,
  onOpenExportImport,
  totalKK,
  totalJiwa,
  nurseAvatar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand single wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src="https://iili.io/nV7JfqB.png"
                alt="Logo Nakes Desa Kringa"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/src/assets/images/app_logo.png';
                }}
              />
            </div>
            <div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-left font-bold text-lg text-slate-900 tracking-tight leading-none hover:text-emerald-700 transition-colors cursor-pointer"
              >
                NAKES DESA KRINGA
              </button>
              <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Kecamatan Talibura · Kab. Sikka · NTT
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dashboard Real-Time</span>
            </button>

            <button
              onClick={() => setActiveTab('master-data')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'master-data'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Penduduk & KK</span>
            </button>

            <button
              onClick={() => setActiveTab('spm-kesehatan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'spm-kesehatan'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>12 SPM & Penyakit</span>
            </button>

            <button
              onClick={() => setActiveTab('pelaporan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pelaporan'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laporan & WA</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Nurse Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick stats indicator */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900">
              <span className="font-mono tabular-nums font-semibold">{totalKK} KK</span>
              <span className="text-emerald-300">·</span>
              <span className="font-mono tabular-nums font-semibold">{totalJiwa} Jiwa</span>
            </div>

            {/* Nurse Avatar / Profile Trigger */}
            <button
              onClick={onOpenNurseProfile}
              title="Profil Perawat Desa: Gabriela Ana Lewar, S.Kep., Ns."
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50 transition-all text-left group"
            >
              <img
                src={nurseAvatar || NURSE_PROFILE.avatar}
                alt={NURSE_PROFILE.nama}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/30"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 leading-tight">
                  Gabriela A. Lewar
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Perawat Desa</div>
              </div>
            </button>

            {/* Ekspor & Impor File Button */}
            <button
              onClick={onOpenExportImport}
              title="Ekspor & Impor Data Penduduk per Dusun & RT/RW"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Ekspor & Impor</span>
              <span className="md:hidden">File</span>
            </button>

            {/* Add KK Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Input Kartu Keluarga</span>
              <span className="sm:hidden">Input KK</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 font-medium ${
              activeTab === 'dashboard' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-500'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('master-data')}
            className={`px-2 py-1 font-medium ${
              activeTab === 'master-data' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-500'
            }`}
          >
            Penduduk
          </button>
          <button
            onClick={() => setActiveTab('spm-kesehatan')}
            className={`px-2 py-1 font-medium ${
              activeTab === 'spm-kesehatan' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-500'
            }`}
          >
            12 SPM
          </button>
          <button
            onClick={() => setActiveTab('pelaporan')}
            className={`px-2 py-1 font-medium ${
              activeTab === 'pelaporan' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-500'
            }`}
          >
            Laporan/WA
          </button>
        </div>
      </div>
    </header>
  );
};
