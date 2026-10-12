import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Heart,
  HeartPulse,
  HelpCircle,
  Home,
  MapPin,
  MessageCircle,
  PieChart,
  Printer,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { DusunName, KartuKeluarga } from '../types';
import {
  DUSUN_LIST,
  calculateDusunSummaries,
  calculateRekapitulasi,
  formatUmurDisplay,
} from '../utils/calculations';
import { exportToCsv } from '../utils/exportUtils';
import { TARGET_WA_NUMBER } from '../utils/whatsapp';

interface DashboardViewProps {
  keluargaList: KartuKeluarga[];
  onOpenAddModal: () => void;
  onOpenReportTab: () => void;
  onSelectKeluarga: (kk: KartuKeluarga) => void;
  onOpenExportImport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  keluargaList,
  onOpenAddModal,
  onOpenReportTab,
  onSelectKeluarga,
  onOpenExportImport,
}) => {
  const [selectedDusun, setSelectedDusun] = useState<DusunName | 'Semua'>('Semua');
  const [selectedRt, setSelectedRt] = useState<string>('Semua');

  // Kalkulasi real-time
  const rekap = calculateRekapitulasi(keluargaList, selectedDusun, selectedRt);
  const dusunSummaries = calculateDusunSummaries(keluargaList);

  // Available RT based on selected dusun
  const availableRts = Array.from(
    new Set(
      keluargaList
        .filter((k) => (selectedDusun === 'Semua' ? true : k.dusun === selectedDusun))
        .map((k) => k.rt)
    )
  ).sort();

  // Kasus Prioritas Pengawasan Nakes (Ibu Hamil Risti, Balita Stunting, TB Paru)
  const bumilRistiList = keluargaList.flatMap((kk) =>
    kk.anggota
      .filter(
        (a) =>
          a.ibuHamil?.isHamil &&
          (a.ibuHamil.statusRisiko === 'Resti / Risiko Tinggi' ||
            a.ibuHamil.statusRisiko === 'KEK (Kurang Energi Kronis)' ||
            a.ibuHamil.statusRisiko === 'Anemia')
      )
      .map((a) => ({ anggota: a, kk }))
  );

  const balitaStuntingList = keluargaList.flatMap((kk) =>
    kk.anggota
      .filter(
        (a) =>
          a.balita &&
          (a.balita.statusGizi === 'Stunting' ||
            a.balita.statusGizi === 'Risiko Stunting' ||
            a.balita.statusGizi === 'Gizi Kurang')
      )
      .map((a) => ({ anggota: a, kk }))
  );

  const ptmPriorityList = keluargaList.flatMap((kk) =>
    kk.anggota
      .filter((a) => a.penyakitSpm?.tbParu || a.penyakitSpm?.odgjBerat || (a.penyakitSpm?.hipertensi && a.penyakitSpm?.tekananDarah?.includes('160')))
      .map((a) => ({ anggota: a, kk }))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter & Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Health Surveillance · Desa Kringa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Kesehatan Warga
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pemetaan wilayah 3 Dusun: Dusun KRINGA, Dusun BOGANATAR, dan Dusun OGOLIDI.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Dusun */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <button
                onClick={() => {
                  setSelectedDusun('Semua');
                  setSelectedRt('Semua');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedDusun === 'Semua'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Dusun
              </button>
              {DUSUN_LIST.map((dusun) => (
                <button
                  key={dusun}
                  onClick={() => {
                    setSelectedDusun(dusun);
                    setSelectedRt('Semua');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedDusun === dusun
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dusun.replace('Dusun ', '')}
                </button>
              ))}
            </div>

            {/* Filter RT */}
            {availableRts.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-medium">RT:</span>
                <select
                  value={selectedRt}
                  onChange={(e) => setSelectedRt(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Semua RT</option>
                  {availableRts.map((rt) => (
                    <option key={rt} value={rt}>
                      RT {rt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Export & Import per Dusun */}
            <button
              onClick={onOpenExportImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Menu Ekspor & Impor Data Penduduk per Dusun & RT/RW"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor & Impor</span>
            </button>

            <button
              onClick={onOpenReportTab}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              title="Kirim Laporan Otomatis ke WhatsApp +6281337401814"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Laporan WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Metrics Grid (Auto calculated real-time) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Penduduk & KK */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Penduduk (Jiwa)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {rekap.totalPenduduk}
            </span>
            <span className="text-xs text-slate-500">jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>L: <strong className="font-mono text-slate-800">{rekap.totalLakiLaki}</strong></span>
            <span>·</span>
            <span>P: <strong className="font-mono text-slate-800">{rekap.totalPerempuan}</strong></span>
            <span>·</span>
            <span><strong className="font-mono text-emerald-700">{rekap.totalKK}</strong> KK</span>
          </div>
        </div>

        {/* Bayi (0-12 bln) & Balita (12-60 bln) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bayi & Balita (0 - 5 Thn)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {rekap.totalBayi + rekap.totalBalita}
            </span>
            <span className="text-xs text-teal-700 font-medium">Anak</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Bayi (0-12 bln): <strong className="font-mono text-slate-800">{rekap.totalBayi}</strong></span>
            <span>·</span>
            <span>Balita: <strong className="font-mono text-slate-800">{rekap.totalBalita}</strong></span>
          </div>
        </div>

        {/* Lansia (>= 60 Tahun) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lansia (≥ 60 Tahun)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {rekap.totalLansia}
            </span>
            <span className="text-xs text-slate-500">warga</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pria: <strong className="font-mono text-slate-800">{rekap.totalLansiaLaki}</strong></span>
            <span>·</span>
            <span>Wanita: <strong className="font-mono text-slate-800">{rekap.totalLansiaPerempuan}</strong></span>
            <span>·</span>
            <span className="text-amber-700 font-medium">Skrining Rutin</span>
          </div>
        </div>

        {/* Ibu Hamil & PUS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ibu Hamil & PUS</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-600">
              {rekap.totalIbuHamil}
            </span>
            <span className="text-xs text-slate-500">Bumil</span>
            {rekap.totalBumilResti > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold ml-auto">
                {rekap.totalBumilResti} Risti
              </span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>PUS: <strong className="font-mono text-slate-800">{rekap.totalPus}</strong></span>
            <span>·</span>
            <span>WUS: <strong className="font-mono text-slate-800">{rekap.totalWus}</strong></span>
          </div>
        </div>
      </div>

      {/* Rincian Pemetaan Per Dusun (Kringa, Boganatar, Ogolidi) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pemetaan Kesehatan 3 Dusun Desa Kringa
            </h2>
            <p className="text-xs text-slate-500">
              Distribusi Kepala Keluarga (KK), demografi umur, dan sasaran kesehatan per dusun.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            3 Wilayah Binaan
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dusunSummaries.map((d, index) => {
            const isSelected = selectedDusun === d.dusun;
            return (
              <div
                key={d.dusun}
                onClick={() => setSelectedDusun(isSelected ? 'Semua' : d.dusun)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{d.dusun}</h3>
                  </div>
                  <span className="text-xs font-semibold font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    {d.totalKK} KK
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Total Jiwa</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {d.totalJiwa} <span className="text-[10px] font-normal text-slate-500">({d.lakiLaki}L / {d.perempuan}P)</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Bayi / Balita</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {d.bayi} <span className="text-[10px] font-normal text-slate-500">bayi</span> · {d.balita} <span className="text-[10px] font-normal text-slate-500">balita</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Lansia (≥60 Thn)</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {d.lansia} <span className="text-[10px] font-normal text-slate-500">orang</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Ibu Hamil</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {d.ibuHamil} {d.bumilResti > 0 && <span className="text-rose-600 font-normal text-[10px]">({d.bumilResti} Risti)</span>}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Hipertensi: <strong className="font-mono text-slate-800">{d.hipertensi}</strong></span>
                  <span>DM: <strong className="font-mono text-slate-800">{d.diabetes}</strong></span>
                  <span>TB: <strong className="font-mono text-slate-800">{d.tbParu}</strong></span>
                  {d.stunting > 0 && (
                    <span className="text-amber-700 font-semibold">Stunting: {d.stunting}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cohort Breakdown & 12 SPM Monitoring Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demografi Kelompok Umur Lengkap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Kelompok Umur (Real-Time)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">100% Otomatis</span>
          </div>

          <div className="space-y-3">
            {/* Bayi */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Bayi (0 - 12 Bulan)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalBayi} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalBayi / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Balita */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Balita (12 - 60 Bulan)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalBalita} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalBalita / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Anak Sekolah */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Anak Sekolah (5 - 9 Tahun)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalAnakSekolah} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalAnakSekolah / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Remaja */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Remaja (10 - 18 Tahun)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalRemaja} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalRemaja / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Usia Produktif */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Usia Produktif (15 - 59 Tahun)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalUsiaProduktif} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalUsiaProduktif / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Lansia */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Lansia (≥ 60 Tahun)</span>
                <span className="font-mono font-bold text-slate-900">{rekap.totalLansia} Jiwa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${rekap.totalPenduduk ? (rekap.totalLansia / rekap.totalPenduduk) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Cakupan BPJS / KIS:</span>
              <span className="font-mono font-bold text-emerald-800">
                {rekap.totalBpjs} / {rekap.totalPenduduk} (
                {rekap.totalPenduduk ? Math.round((rekap.totalBpjs / rekap.totalPenduduk) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols width): 12 SPM Kesehatan & Prioritas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Indikator 12 Standar Pelayanan Minimal (SPM) & Penyakit</span>
              </h3>
              <p className="text-xs text-slate-500">
                Capaian pelayanan kesehatan dasar tingkat desa sesuai Permenkes.
              </p>
            </div>
            <button
              onClick={onOpenReportTab}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Laporan Resmi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid SPM indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* 1. Ibu Hamil */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 1: Bumil Terlayani</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalIbuHamil}</span>
                <span className="text-[10px] text-slate-500">Bumil</span>
              </div>
              <div className="text-[10px] text-rose-700 font-medium mt-1">
                {rekap.totalBumilResti} Bumil Risti / KEK
              </div>
            </div>

            {/* 2. Balita & Gizi */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 4: Balita Pantau</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalBalita}</span>
                <span className="text-[10px] text-slate-500">Balita</span>
              </div>
              <div className="text-[10px] text-amber-700 font-medium mt-1">
                {rekap.totalBalitaStunting} Kasus Risiko Stunting
              </div>
            </div>

            {/* 3. Hipertensi */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 8: Hipertensi</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalHipertensi}</span>
                <span className="text-[10px] text-slate-500">Kasus</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">
                Kontrol Rutin di Posbindu
              </div>
            </div>

            {/* 4. Diabetes Melitus */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 9: Diabetes (DM)</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalDiabetes}</span>
                <span className="text-[10px] text-slate-500">Kasus</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">
                Cek Gula Darah Teratur
              </div>
            </div>

            {/* 5. TB Paru */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 11: TB Paru (Menular)</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalTbParu}</span>
                <span className="text-[10px] text-slate-500">Kasus</span>
              </div>
              <div className="text-[10px] text-teal-700 font-medium mt-1">
                Pengobatan OAT 6 Bulan
              </div>
            </div>

            {/* 6. ODGJ */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 block">SPM 10: ODGJ Berat</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalOdgj}</span>
                <span className="text-[10px] text-slate-500">Orang</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium mt-1">
                Konseling & Obat PKM
              </div>
            </div>
          </div>

          {/* Priority Alerts for Home Visits (Kunjungan Rumah Nakes) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Daftar Perhatian Khusus & Kunjungan Rumah Perawat</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {bumilRistiList.map(({ anggota, kk }) => (
                <div
                  key={anggota.id}
                  onClick={() => onSelectKeluarga(kk)}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-rose-950">{anggota.nama}</div>
                    <div className="text-[11px] text-rose-800">
                      Bumil {anggota.ibuHamil?.statusRisiko} · Usia {anggota.ibuHamil?.usiaKehamilanMinggu} Minggu
                    </div>
                    <div className="text-[10px] text-slate-600">{kk.dusun}, RT {kk.rt}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
              ))}

              {balitaStuntingList.map(({ anggota, kk }) => (
                <div
                  key={anggota.id}
                  onClick={() => onSelectKeluarga(kk)}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-amber-950">{anggota.nama}</div>
                    <div className="text-[11px] text-amber-800">
                      {anggota.balita?.statusGizi} · Umur: {formatUmurDisplay(anggota.tanggalLahir)}
                    </div>
                    <div className="text-[10px] text-slate-600">{kk.dusun}, RT {kk.rt}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
