import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { DusunName, KartuKeluarga } from '../types';
import { DUSUN_LIST } from '../utils/calculations';
import {
  downloadCsvTemplate,
  exportToCsv,
  exportToExcelCaptureFormat,
  exportToJson,
  filterKeluargaByWilayah,
  parseCsvToKeluargaList,
} from '../utils/exportUtils';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  keluargaList: KartuKeluarga[];
  onImportData: (importedKkList: KartuKeluarga[], mode: 'merge' | 'replace', dusunTarget?: string) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  keluargaList,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Filter states for Export
  const [exportDusun, setExportDusun] = useState<string>('Semua');
  const [exportRt, setExportRt] = useState<string>('Semua');
  const [exportRw, setExportRw] = useState<string>('Semua');

  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileType, setImportFileType] = useState<'csv' | 'json'>('csv');
  const [parsedPreview, setParsedPreview] = useState<KartuKeluarga[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [overrideWilayah, setOverrideWilayah] = useState(false);
  const [targetDusun, setTargetDusun] = useState<DusunName>('Dusun KRINGA');
  const [targetRt, setTargetRt] = useState('01');
  const [targetRw, setTargetRw] = useState('01');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Available RT & RW in data
  const availableRts = useMemo(() => {
    return Array.from(
      new Set(
        keluargaList
          .filter((k) => (exportDusun === 'Semua' ? true : k.dusun === exportDusun))
          .map((k) => k.rt)
      )
    ).sort();
  }, [keluargaList, exportDusun]);

  const availableRws = useMemo(() => {
    return Array.from(
      new Set(
        keluargaList
          .filter((k) => (exportDusun === 'Semua' ? true : k.dusun === exportDusun))
          .map((k) => k.rw)
      )
    ).sort();
  }, [keluargaList, exportDusun]);

  // Filtered preview for Export
  const exportPreviewList = useMemo(() => {
    return filterKeluargaByWilayah(keluargaList, exportDusun, exportRt, exportRw);
  }, [keluargaList, exportDusun, exportRt, exportRw]);

  const totalExportJiwa = useMemo(() => {
    return exportPreviewList.reduce((acc, kk) => acc + kk.anggota.length, 0);
  }, [exportPreviewList]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setParseError(null);
    setImportSuccessMsg(null);
    setParsedPreview(null);

    const isJson = file.name.endsWith('.json');
    setImportFileType(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (isJson) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setParsedPreview(parsed);
          } else {
            setParseError('Berkas JSON tidak berisi daftar data Kartu Keluarga.');
          }
        } catch (err: any) {
          setParseError(`Format berkas JSON tidak valid: ${err?.message}`);
        }
      } else {
        const res = parseCsvToKeluargaList(
          text,
          overrideWilayah ? targetDusun : undefined,
          overrideWilayah ? targetRt : undefined,
          overrideWilayah ? targetRw : undefined
        );
        if (res.success) {
          setParsedPreview(res.data);
        } else {
          setParseError(res.error || 'Gagal memproses berkas CSV.');
        }
      }
    };

    reader.readAsText(file);
  };

  const executeImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) {
      alert('Tidak ada data yang valid untuk diimpor.');
      return;
    }

    let finalData = parsedPreview;
    if (overrideWilayah) {
      finalData = parsedPreview.map((kk) => ({
        ...kk,
        dusun: targetDusun,
        rt: targetRt,
        rw: targetRw,
        alamat: `${targetDusun} RT ${targetRt} / RW ${targetRw}`,
      }));
    }

    onImportData(finalData, importMode, overrideWilayah ? targetDusun : undefined);
    setImportSuccessMsg(
      `Berhasil mengimpor ${finalData.length} Kartu Keluarga (${finalData.reduce(
        (acc, k) => acc + k.anggota.length,
        0
      )} Jiwa)!`
    );
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Menu Ekspor & Impor Data Penduduk</h2>
              <p className="text-xs text-emerald-200">
                Pemetaan wilayah Desa Kringa per Dusun, RT, dan RW
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-emerald-600 bg-white text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Data Sesuai Dusun & RT/RW</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-emerald-600 bg-white text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Impor Data File Penduduk</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* TAB 1: EKSPOR */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Wilayah Yang Ingin Diekspor:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dusun Filter */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Dusun:</label>
                    <select
                      value={exportDusun}
                      onChange={(e) => {
                        setExportDusun(e.target.value);
                        setExportRt('Semua');
                        setExportRw('Semua');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800"
                    >
                      <option value="Semua">Semua Dusun (Seluruh Desa)</option>
                      {DUSUN_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RT Filter */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Rukun Tetangga (RT):</label>
                    <select
                      value={exportRt}
                      onChange={(e) => setExportRt(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800"
                    >
                      <option value="Semua">Semua RT</option>
                      {availableRts.map((r) => (
                        <option key={r} value={r}>
                          RT {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RW Filter */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Rukun Warga (RW):</label>
                    <select
                      value={exportRw}
                      onChange={(e) => setExportRw(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800"
                    >
                      <option value="Semua">Semua RW</option>
                      {availableRws.map((w) => (
                        <option key={w} value={w}>
                          RW {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter summary badge */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    Wilayah Terpilih: <strong>{exportDusun}</strong> · RT <strong>{exportRt}</strong> / RW <strong>{exportRw}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {exportPreviewList.length} KK ({totalExportJiwa} Jiwa)
                  </span>
                </div>
              </div>

              {/* Action Download Buttons */}
              <div className="space-y-3 pt-2">
                {/* Format Preview Banner matching user's Capture.JPG */}
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Format Excel Resmi (Sesuai Kolom RT/RW):
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Format Excel .xls Aktif
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 overflow-x-auto whitespace-nowrap bg-white p-2 rounded border border-slate-200">
                    NO. KK | NO. | NAMA KK DAN ANGGOTA | TTL | AGAMA | JK | NO KK | NIK | PENDIDIKAM | PEKERJAAN
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    * Nomor KK & NIK diformat teks agar tidak terpotong menjadi notasi ilmiah di Excel. Dilengkapi baris pemisah antar keluarga.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary Button requested by User */}
                  <button
                    type="button"
                    onClick={() => exportToExcelCaptureFormat(keluargaList, exportDusun, exportRt, exportRw)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold transition-all shadow-xs cursor-pointer"
                    title="Unduh Format Excel Sesuai Format RT/RW"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Unduh File Format Excel (.xls)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToJson(keluargaList, exportDusun, exportRt, exportRw)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File JSON Backup (.json)</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Memerlukan format register lengkap 12 SPM?</span>
                  <button
                    type="button"
                    onClick={() => exportToCsv(keluargaList, exportDusun, exportRt, exportRw)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                  >
                    Unduh Format Register Medis CSV
                  </button>
                </div>
              </div>

              {/* Template CSV Download */}
              <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-950">Unduh Format Template CSV Kosong</div>
                  <div className="text-[11px] text-emerald-700">
                    Gunakan template ini untuk pengisian data lapangan oleh kader Posyandu/RT secara offline.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsvTemplate(exportDusun === 'Semua' ? 'Dusun KRINGA' : exportDusun)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPOR */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {importSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  id="import-file-input"
                  accept=".csv,.txt,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="import-file-input" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm block">
                    {importFile ? importFile.name : 'Klik untuk Pilih File Data Penduduk'}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Mendukung file format <strong>.CSV</strong> (Excel) atau <strong>.JSON</strong> (Cadangan)
                  </span>
                </label>
              </div>

              {/* Import Options & Wilayah Mapping */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Pilihan Pemetaan Wilayah & Metode Impor:</span>

                {/* Option 1: Override Dusun RT RW */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={overrideWilayah}
                      onChange={(e) => setOverrideWilayah(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Petakan / Masukkan Semua Data ke Wilayah Tertentu:</span>
                  </label>

                  {overrideWilayah && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6 pt-1">
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Target Dusun:</label>
                        <select
                          value={targetDusun}
                          onChange={(e) => setTargetDusun(e.target.value as DusunName)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold"
                        >
                          {DUSUN_LIST.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Target RT:</label>
                        <input
                          type="text"
                          value={targetRt}
                          onChange={(e) => setTargetRt(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Target RW:</label>
                        <input
                          type="text"
                          value={targetRw}
                          onChange={(e) => setTargetRw(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Merge or Replace */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="import-mode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-emerald-600"
                    />
                    <span>Gabungkan dengan data yang ada</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="import-mode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600"
                    />
                    <span className="text-rose-700 font-medium">Ganti / Timpa data wilayah ini</span>
                  </label>
                </div>
              </div>

              {/* Preview Box */}
              {parsedPreview && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Data Siap Diimpor:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      {parsedPreview.length} KK ({parsedPreview.reduce((acc, k) => acc + k.anggota.length, 0)} Jiwa)
                    </span>
                  </div>

                  <div className="max-h-32 overflow-y-auto bg-white p-2 rounded-lg border border-emerald-200 divide-y divide-slate-100 text-[11px]">
                    {parsedPreview.slice(0, 5).map((kk, idx) => (
                      <div key={idx} className="py-1 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800">{kk.kepalaKeluargaNama || 'Keluarga'}</strong>{' '}
                          <span className="text-slate-400 font-mono">({kk.noKK})</span>
                        </div>
                        <div className="text-slate-500">
                          {overrideWilayah ? targetDusun : kk.dusun} · {kk.anggota.length} Jiwa
                        </div>
                      </div>
                    ))}
                    {parsedPreview.length > 5 && (
                      <div className="py-1 text-center text-slate-400 italic">
                        ...dan {parsedPreview.length - 5} Kartu Keluarga lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Import Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!parsedPreview || parsedPreview.length === 0}
                  onClick={executeImport}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Mulai Impor Data Penduduk</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
