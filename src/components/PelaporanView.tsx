import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Printer,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Upload,
  User,
} from 'lucide-react';
import { KartuKeluarga } from '../types';
import {
  calculateDusunSummaries,
  calculateRekapitulasi,
} from '../utils/calculations';
import { exportToCsv, exportToJson } from '../utils/exportUtils';
import {
  CLEAN_WA_NUMBER,
  NURSE_PROFILE,
  TARGET_WA_NUMBER,
  generateWhatsAppReportText,
  getWhatsAppUrl,
} from '../utils/whatsapp';

interface PelaporanViewProps {
  keluargaList: KartuKeluarga[];
  onImportBackup: (newList: KartuKeluarga[]) => void;
  onResetSampleData: () => void;
}

export const PelaporanView: React.FC<PelaporanViewProps> = ({
  keluargaList,
  onImportBackup,
  onResetSampleData,
}) => {
  const [periodeLaporan, setPeriodeLaporan] = useState('Bulan Ini (Reguler)');
  const [catatanTambahan, setCatatanTambahan] = useState(
    'Pelaksanaan Posyandu Balita dan Lansia di 3 Dusun berjalan lancar. Kunjungan rumah pada ibu hamil risiko tinggi dan balita risiko stunting telah terjadwal secara berkala.'
  );
  const [copied, setCopied] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);

  const rekap = calculateRekapitulasi(keluargaList);
  const dusunList = calculateDusunSummaries(keluargaList);

  const reportText = generateWhatsAppReportText(
    keluargaList,
    `${periodeLaporan} - Desa Kringa`
  );

  const waUrl = getWhatsAppUrl(reportText, CLEAN_WA_NUMBER);

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWa = () => {
    const timeNow = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setLastSentTime(timeNow);
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportBackup(json);
          alert(`Berhasil memulihkan ${json.length} data Kartu Keluarga!`);
        } else {
          alert('Format berkas JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Sistem Pelaporan Otomatis Berkala</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Pelaporan Resmi Tingkat Kelurahan & WhatsApp
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Otomatis terhubung dengan nomor WhatsApp Nakes/Desa: <strong className="font-mono text-emerald-800">{TARGET_WA_NUMBER}</strong>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks WA'}</span>
            </button>

            <button
              onClick={handleSendWa}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim ke WA ({TARGET_WA_NUMBER})</span>
            </button>
          </div>
        </div>

        {lastSentTime && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Laporan terakhir dikirim ke WhatsApp pada pukul <strong>{lastSentTime} WITA</strong>.</span>
          </div>
        )}
      </div>

      {/* Grid: Laporan Resmi Desa (Printable) & WhatsApp Automation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Report Document (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-center gap-4 text-center">
            <img
              src="https://iili.io/nV7JfqB.png"
              alt="Logo Resmi"
              className="w-14 h-14 object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/app_logo.png';
              }}
            />
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pemerintah Kabupaten Sikka · Kecamatan Talibura
              </div>
              <div className="text-lg font-extrabold uppercase text-emerald-950">
                Kantor Desa Kringa · Pos Kesehatan Desa (Poskesdes)
              </div>
              <div className="text-[11px] text-slate-500">
                Laporan Rekapitulasi Data Kesehatan Warga (Dusun KRINGA, Dusun BOGANATAR, Dusun OGOLIDI)
              </div>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Periode Laporan:</span>
              <span className="font-bold text-slate-800">{periodeLaporan}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Petugas Nakes:</span>
              <span className="font-bold text-slate-800">{NURSE_PROFILE.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Nomor Kontak Nakes:</span>
              <span className="font-mono font-bold text-emerald-800">{TARGET_WA_NUMBER}</span>
            </div>
          </div>

          {/* Section 1: Demografi Warga */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span>I. Rekapitulasi Total Penduduk & Kepala Keluarga</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Total Penduduk</span>
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalPenduduk} Jiwa</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Kepala Keluarga (KK)</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{rekap.totalKK} KK</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Laki-laki</span>
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalLakiLaki} Jiwa</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Perempuan</span>
                <span className="text-lg font-bold font-mono text-slate-900">{rekap.totalPerempuan} Jiwa</span>
              </div>
            </div>
          </div>

          {/* Section 2: Rincian 3 Dusun */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              II. Rincian Pemetaan Per Dusun (Kringa, Boganatar, Ogolidi)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Nama Dusun</th>
                    <th className="py-2 px-2 text-right">Total KK</th>
                    <th className="py-2 px-2 text-right">Jiwa</th>
                    <th className="py-2 px-2 text-right">Bayi</th>
                    <th className="py-2 px-2 text-right">Balita</th>
                    <th className="py-2 px-2 text-right">Lansia</th>
                    <th className="py-2 px-2 text-right">Bumil</th>
                    <th className="py-2 px-3 text-right">Kasus SPM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dusunList.map((d) => (
                    <tr key={d.dusun} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{d.dusun}</td>
                      <td className="py-2 px-2 text-right font-mono font-semibold">{d.totalKK}</td>
                      <td className="py-2 px-2 text-right font-mono">{d.totalJiwa}</td>
                      <td className="py-2 px-2 text-right font-mono">{d.bayi}</td>
                      <td className="py-2 px-2 text-right font-mono">{d.balita}</td>
                      <td className="py-2 px-2 text-right font-mono">{d.lansia}</td>
                      <td className="py-2 px-2 text-right font-mono">
                        {d.ibuHamil} {d.bumilResti > 0 && <span className="text-rose-600">({d.bumilResti} R)</span>}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600">
                        HT:{d.hipertensi}, DM:{d.diabetes}, TB:{d.tbParu}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Indikator 12 SPM */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              III. Indikator 12 SPM & Penyakit Menular / Tidak Menular
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Ibu Hamil (Bumil)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalIbuHamil} Orang ({rekap.totalBumilResti} Resti/KEK)
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Balita Stunting</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalBalitaStunting} Kasus
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Penderita Hipertensi</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalHipertensi} Orang
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Diabetes Melitus</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalDiabetes} Orang
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Terduga TB Paru</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalTbParu} Kasus (OAT)
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">ODGJ Berat</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rekap.totalOdgj} Orang
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Nakes & Tanda Tangan */}
          <div className="pt-2 space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Catatan Nakes Desa:</span>
              <p className="text-slate-600 italic">{catatanTambahan}</p>
            </div>

            <div className="grid grid-cols-2 text-center text-xs pt-4">
              <div>
                <p className="text-slate-500 mb-14">Mengetahui,<br />Kepala Desa / Lurah Kringa</p>
                <p className="font-bold underline text-slate-900">( ........................................ )</p>
              </div>
              <div>
                <p className="text-slate-500">Desa Kringa, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-slate-500 mb-14">Perawat Pembina Desa Kringa</p>
                <p className="font-bold underline text-slate-900">{NURSE_PROFILE.nama}</p>
                <p className="text-[10px] text-slate-500 font-mono">STR: {NURSE_PROFILE.str}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Automation & Data Backup Management (1 Col) */}
        <div className="space-y-4 no-print">
          {/* WhatsApp Broadcast Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Kirim Otomatis ke WA</h3>
                <span className="text-[11px] text-slate-500 font-mono">{TARGET_WA_NUMBER}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">Format Pesan WhatsApp:</span>
                <button
                  onClick={handleCopyText}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]"
                >
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap select-all">
                {reportText}
              </div>
            </div>

            <button
              onClick={handleSendWa}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp & Kirim Laporan</span>
            </button>
          </div>

          {/* Backup & Data Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Ekspor & Cadangkan Data Desa</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => exportToCsv(keluargaList)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors"
              >
                <span>Unduh Format Excel / CSV</span>
                <Download className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => exportToJson(keluargaList)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors"
              >
                <span>Cadangkan Database (JSON)</span>
                <Download className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <label className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors cursor-pointer">
                <span>Pulihkan dari Cadangan (JSON)</span>
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Kembalikan ke data contoh resmi Desa Kringa (Dusun Kringa, Boganatar, Ogolidi)?'
                    )
                  ) {
                    onResetSampleData();
                  }
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-slate-600 hover:text-amber-800 transition-colors"
              >
                <span>Muat Ulang Contoh Data Nyata</span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
