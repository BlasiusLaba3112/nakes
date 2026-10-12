import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Baby,
  ChevronDown,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  Heart,
  HeartPulse,
  Home,
  MapPin,
  Plus,
  Printer,
  Search,
  Stethoscope,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnggotaKeluarga, DusunName, KartuKeluarga } from '../types';
import {
  DUSUN_LIST,
  formatUmurDisplay,
  getKategoriUsia,
} from '../utils/calculations';
import { exportToCsv } from '../utils/exportUtils';

interface PendudukTableProps {
  keluargaList: KartuKeluarga[];
  onOpenAddModal: () => void;
  onEditKeluarga: (kk: KartuKeluarga) => void;
  onDeleteKeluarga: (kkId: string) => void;
  onSelectKeluarga: (kk: KartuKeluarga) => void;
  onOpenExportImport: () => void;
}

export const PendudukTable: React.FC<PendudukTableProps> = ({
  keluargaList,
  onOpenAddModal,
  onEditKeluarga,
  onDeleteKeluarga,
  onSelectKeluarga,
  onOpenExportImport,
}) => {
  const [viewMode, setViewMode] = useState<'kk' | 'individu'>('kk');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState<DusunName | 'Semua'>('Semua');
  const [selectedRt, setSelectedRt] = useState<string>('Semua');
  const [selectedKategoriUsia, setSelectedKategoriUsia] = useState<string>('Semua');
  const [selectedPenyakit, setSelectedPenyakit] = useState<string>('Semua');
  const [kkToDelete, setKkToDelete] = useState<KartuKeluarga | null>(null);

  // Filtered Kartu Keluarga
  const filteredKkList = useMemo(() => {
    return keluargaList.filter((kk) => {
      // Filter Dusun
      if (selectedDusun !== 'Semua' && kk.dusun !== selectedDusun) return false;
      // Filter RT
      if (selectedRt !== 'Semua' && kk.rt !== selectedRt) return false;

      // Filter Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKk =
          kk.noKK.toLowerCase().includes(q) ||
          kk.alamat.toLowerCase().includes(q) ||
          kk.kepalaKeluargaNama.toLowerCase().includes(q);
        const matchAnggota = kk.anggota.some(
          (a) => a.nama.toLowerCase().includes(q) || a.nik.toLowerCase().includes(q)
        );
        if (!matchKk && !matchAnggota) return false;
      }

      // Filter Kategori Usia
      if (selectedKategoriUsia !== 'Semua') {
        const hasMatchingAge = kk.anggota.some((a) => {
          const kat = getKategoriUsia(a.tanggalLahir);
          return kat.toLowerCase().includes(selectedKategoriUsia.toLowerCase());
        });
        if (!hasMatchingAge) return false;
      }

      // Filter Penyakit / Status Khusus
      if (selectedPenyakit !== 'Semua') {
        const hasCondition = kk.anggota.some((a) => {
          if (selectedPenyakit === 'bumil') return a.ibuHamil?.isHamil;
          if (selectedPenyakit === 'bumil-resti')
            return a.ibuHamil?.isHamil && a.ibuHamil.statusRisiko !== 'Normal';
          if (selectedPenyakit === 'stunting')
            return a.balita && (a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting');
          if (selectedPenyakit === 'hipertensi') return a.penyakitSpm?.hipertensi;
          if (selectedPenyakit === 'dm') return a.penyakitSpm?.diabetesMelitus;
          if (selectedPenyakit === 'tb') return a.penyakitSpm?.tbParu;
          if (selectedPenyakit === 'odgj') return a.penyakitSpm?.odgjBerat;
          return true;
        });
        if (!hasCondition) return false;
      }

      return true;
    });
  }, [keluargaList, selectedDusun, selectedRt, searchQuery, selectedKategoriUsia, selectedPenyakit]);

  // Flattened Individu list for 'individu' view
  const flattenedIndividu = useMemo(() => {
    const list: { anggota: AnggotaKeluarga; kk: KartuKeluarga }[] = [];
    filteredKkList.forEach((kk) => {
      kk.anggota.forEach((anggota) => {
        // Apply individual filters if active
        if (selectedKategoriUsia !== 'Semua') {
          const kat = getKategoriUsia(anggota.tanggalLahir);
          if (!kat.toLowerCase().includes(selectedKategoriUsia.toLowerCase())) return;
        }

        if (selectedPenyakit !== 'Semua') {
          if (selectedPenyakit === 'bumil' && !anggota.ibuHamil?.isHamil) return;
          if (
            selectedPenyakit === 'bumil-resti' &&
            (!anggota.ibuHamil?.isHamil || anggota.ibuHamil.statusRisiko === 'Normal')
          )
            return;
          if (
            selectedPenyakit === 'stunting' &&
            (!anggota.balita || (anggota.balita.statusGizi !== 'Stunting' && anggota.balita.statusGizi !== 'Risiko Stunting'))
          )
            return;
          if (selectedPenyakit === 'hipertensi' && !anggota.penyakitSpm?.hipertensi) return;
          if (selectedPenyakit === 'dm' && !anggota.penyakitSpm?.diabetesMelitus) return;
          if (selectedPenyakit === 'tb' && !anggota.penyakitSpm?.tbParu) return;
          if (selectedPenyakit === 'odgj' && !anggota.penyakitSpm?.odgjBerat) return;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            anggota.nama.toLowerCase().includes(q) ||
            anggota.nik.toLowerCase().includes(q) ||
            kk.noKK.toLowerCase().includes(q);
          if (!match) return;
        }

        list.push({ anggota, kk });
      });
    });
    return list;
  }, [filteredKkList, selectedKategoriUsia, selectedPenyakit, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header controls & views switch */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented View Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('kk')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'kk'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Kartu Keluarga ({filteredKkList.length} KK)</span>
            </button>
            <button
              onClick={() => setViewMode('individu')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'individu'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Semua Individu Penduduk ({flattenedIndividu.length} Jiwa)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExportImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200/80"
              title="Menu Ekspor & Impor Data Sesuai Dusun, RT, dan RW"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor & Impor Dusun/RT/RW</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input KK Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Multi-filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Warga, NIK, No KK, atau Alamat..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Dusun Filter */}
          <div>
            <select
              value={selectedDusun}
              onChange={(e) => setSelectedDusun(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-700 font-medium"
            >
              <option value="Semua">Semua Dusun</option>
              {DUSUN_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Usia Filter */}
          <div>
            <select
              value={selectedKategoriUsia}
              onChange={(e) => setSelectedKategoriUsia(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-700 font-medium"
            >
              <option value="Semua">Semua Kategori Umur</option>
              <option value="Bayi">Bayi (0-12 Bulan)</option>
              <option value="Balita">Balita (12-60 Bulan)</option>
              <option value="Remaja">Remaja (10-18 Tahun)</option>
              <option value="Produktif">Usia Produktif (15-59 Tahun)</option>
              <option value="Lansia">Lansia (≥60 Tahun)</option>
            </select>
          </div>

          {/* Status Penyakit / Khusus */}
          <div>
            <select
              value={selectedPenyakit}
              onChange={(e) => setSelectedPenyakit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-700 font-medium"
            >
              <option value="Semua">Semua Status Khusus</option>
              <option value="bumil">Ibu Hamil (Semua)</option>
              <option value="bumil-resti">Ibu Hamil Resti / KEK</option>
              <option value="stunting">Balita Risiko Stunting</option>
              <option value="hipertensi">Hipertensi (PTM)</option>
              <option value="dm">Diabetes Melitus (PTM)</option>
              <option value="tb">TB Paru (Menular)</option>
              <option value="odgj">ODGJ Berat</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: Kartu Keluarga List */}
      {viewMode === 'kk' && (
        <div className="space-y-3">
          {filteredKkList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada Kartu Keluarga ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Silakan sesuaikan kata kunci pencarian atau filter wilayah dusun, atau klik tombol di bawah untuk menambah data keluarga baru.
              </p>
              <button
                onClick={onOpenAddModal}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
              >
                + Input KK Baru
              </button>
            </div>
          ) : (
            filteredKkList.map((kk) => {
              const kepala = kk.anggota.find((a) => a.hubungan === 'Kepala Keluarga') || kk.anggota[0];
              const adaBumil = kk.anggota.some((a) => a.ibuHamil?.isHamil);
              const adaStunting = kk.anggota.some(
                (a) => a.balita && (a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting')
              );
              const adaTb = kk.anggota.some((a) => a.penyakitSpm?.tbParu);

              return (
                <div
                  key={kk.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                        <Home className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">
                            {kepala?.nama || kk.kepalaKeluargaNama}
                          </h3>
                          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            No KK: {kk.noKK}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="font-semibold text-emerald-800">{kk.dusun}</span>
                          <span>·</span>
                          <span>RT {kk.rt} / RW {kk.rw}</span>
                          <span>·</span>
                          <span>{kk.alamat}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onSelectKeluarga(kk)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Buka Rekam Medis & Detail Kartu Keluarga"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & Cetak</span>
                      </button>
                      <button
                        onClick={() => onEditKeluarga(kk)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Data Keluarga"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setKkToDelete(kk)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kartu Keluarga"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Anggota List in KK */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 font-semibold border-b border-slate-100">
                          <th className="py-1.5 pr-3">NIK</th>
                          <th className="py-1.5 px-3">Nama Anggota</th>
                          <th className="py-1.5 px-3">Hubungan</th>
                          <th className="py-1.5 px-3">L/P</th>
                          <th className="py-1.5 px-3">Umur</th>
                          <th className="py-1.5 px-3">Kategori</th>
                          <th className="py-1.5 px-3">Status Kesehatan / 12 SPM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {kk.anggota.map((a) => {
                          const kategori = getKategoriUsia(a.tanggalLahir);
                          return (
                            <tr key={a.id} className="hover:bg-slate-50/50">
                              <td className="py-2 pr-3 font-mono text-slate-600 font-medium">
                                {a.nik}
                              </td>
                              <td className="py-2 px-3 font-semibold text-slate-800">
                                {a.nama}
                              </td>
                              <td className="py-2 px-3 text-slate-600">{a.hubungan}</td>
                              <td className="py-2 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    a.jenisKelamin === 'Laki-laki'
                                      ? 'text-blue-700 bg-blue-50'
                                      : 'text-rose-700 bg-rose-50'
                                  }`}
                                >
                                  {a.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-700">
                                {formatUmurDisplay(a.tanggalLahir)}
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[11px] text-slate-600 font-medium">
                                  {kategori.split(' ')[0]}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {a.ibuHamil?.isHamil && (
                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                                      Bumil ({a.ibuHamil.statusRisiko})
                                    </span>
                                  )}
                                  {a.balita && (
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                        a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      }`}
                                    >
                                      {a.balita.statusGizi}
                                    </span>
                                  )}
                                  {a.penyakitSpm?.hipertensi && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                      Hipertensi ({a.penyakitSpm.tekananDarah || 'Rutin'})
                                    </span>
                                  )}
                                  {a.penyakitSpm?.diabetesMelitus && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                      Diabetes
                                    </span>
                                  )}
                                  {a.penyakitSpm?.tbParu && (
                                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                                      TB Paru (OAT)
                                    </span>
                                  )}
                                  {a.penyakitSpm?.odgjBerat && (
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                                      ODGJ
                                    </span>
                                  )}
                                  {!a.ibuHamil?.isHamil &&
                                    !a.balita &&
                                    !a.penyakitSpm?.hipertensi &&
                                    !a.penyakitSpm?.diabetesMelitus &&
                                    !a.penyakitSpm?.tbParu &&
                                    !a.penyakitSpm?.odgjBerat && (
                                      <span className="text-slate-400 text-[11px]">- Sehat -</span>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: Semua Individu Penduduk Grid / Table */}
      {viewMode === 'individu' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">NIK & Nama Lengkap</th>
                  <th className="py-3 px-3">L/P</th>
                  <th className="py-3 px-3">Umur & Kategori</th>
                  <th className="py-3 px-3">Dusun & RT/RW</th>
                  <th className="py-3 px-3">Hubungan di KK</th>
                  <th className="py-3 px-3">Status Khusus / 12 SPM</th>
                  <th className="py-3 px-3">No BPJS</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flattenedIndividu.map(({ anggota, kk }) => {
                  const kategori = getKategoriUsia(anggota.tanggalLahir);
                  return (
                    <tr key={anggota.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{anggota.nama}</div>
                        <div className="font-mono text-[11px] text-slate-500">{anggota.nik}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            anggota.jenisKelamin === 'Laki-laki'
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {anggota.jenisKelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-semibold text-slate-800">
                          {formatUmurDisplay(anggota.tanggalLahir)}
                        </div>
                        <div className="text-[11px] text-slate-500">{kategori}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{kk.dusun}</div>
                        <div className="text-[11px] text-slate-500">RT {kk.rt} / RW {kk.rw}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{anggota.hubungan}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {anggota.ibuHamil?.isHamil && (
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                              Bumil ({anggota.ibuHamil.statusRisiko})
                            </span>
                          )}
                          {anggota.balita && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                anggota.balita.statusGizi === 'Stunting' || anggota.balita.statusGizi === 'Risiko Stunting'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {anggota.balita.statusGizi}
                            </span>
                          )}
                          {anggota.penyakitSpm?.hipertensi && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              Hipertensi
                            </span>
                          )}
                          {anggota.penyakitSpm?.diabetesMelitus && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              DM
                            </span>
                          )}
                          {anggota.penyakitSpm?.tbParu && (
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                              TB Paru
                            </span>
                          )}
                          {anggota.penyakitSpm?.odgjBerat && (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                              ODGJ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {anggota.noBpjs || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectKeluarga(kk)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold transition-colors"
                        >
                          Lihat KK
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Data Kartu Keluarga: Tombol YA dan TIDAK */}
      {kkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Data Kartu Keluarga?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apakah Anda yakin ingin menghapus data keluarga ini dari data Nakes Desa Kringa?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setKkToDelete(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kepala Keluarga:</span>
                <span className="font-bold text-slate-900">{kkToDelete.kepalaKeluargaNama}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">No. Kartu Keluarga:</span>
                <span className="font-mono text-slate-700">{kkToDelete.noKK}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wilayah / Dusun:</span>
                <span className="text-emerald-800 font-semibold">{kkToDelete.dusun}, RT {kkToDelete.rt}/RW {kkToDelete.rw}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jumlah Anggota Keluarga:</span>
                <span className="font-semibold text-rose-700">{kkToDelete.anggota.length} Jiwa</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-700 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200/70 leading-relaxed">
              Semua data individu, riwayat kesehatan kelompok umur (Bayi, Balita, Lansia, Ibu Hamil, dan 12 SPM) pada keluarga ini akan dihapus. Perhitungan dashboard akan otomatis terupdate secara langsung.
            </p>

            {/* Tombol YA dan TIDAK yang diminta user */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setKkToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Tidak, Batalkan
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteKeluarga(kkToDelete.id);
                  setKkToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
