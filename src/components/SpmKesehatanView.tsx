import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Baby,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  HeartPulse,
  Info,
  Layers,
  Search,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { AnggotaKeluarga, DusunName, KartuKeluarga } from '../types';
import {
  calculateRekapitulasi,
  formatUmurDisplay,
  getKategoriUsia,
} from '../utils/calculations';

interface SpmKesehatanViewProps {
  keluargaList: KartuKeluarga[];
  onSelectKeluarga: (kk: KartuKeluarga) => void;
  onOpenReportTab: () => void;
}

export const SpmKesehatanView: React.FC<SpmKesehatanViewProps> = ({
  keluargaList,
  onSelectKeluarga,
  onOpenReportTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const rekap = calculateRekapitulasi(keluargaList);

  // Extract all individuals with health conditions
  const allPatients: { anggota: AnggotaKeluarga; kk: KartuKeluarga; category: string }[] = [];

  keluargaList.forEach((kk) => {
    kk.anggota.forEach((a) => {
      if (a.ibuHamil?.isHamil) {
        allPatients.push({ anggota: a, kk, category: 'bumil' });
      }
      if (a.balita && (a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting' || a.balita.statusGizi === 'Gizi Kurang')) {
        allPatients.push({ anggota: a, kk, category: 'balita-stunting' });
      }
      if (a.penyakitSpm?.hipertensi) {
        allPatients.push({ anggota: a, kk, category: 'hipertensi' });
      }
      if (a.penyakitSpm?.diabetesMelitus) {
        allPatients.push({ anggota: a, kk, category: 'diabetes' });
      }
      if (a.penyakitSpm?.tbParu) {
        allPatients.push({ anggota: a, kk, category: 'tb' });
      }
      if (a.penyakitSpm?.odgjBerat) {
        allPatients.push({ anggota: a, kk, category: 'odgj' });
      }
      if (a.penyakitSpm?.malaria || a.penyakitSpm?.dbd) {
        allPatients.push({ anggota: a, kk, category: 'vektor' });
      }
    });
  });

  const filteredPatients = allPatients.filter(({ anggota, kk, category }) => {
    if (activeCategory !== 'semua' && category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        anggota.nama.toLowerCase().includes(q) ||
        anggota.nik.toLowerCase().includes(q) ||
        kk.dusun.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const spmCards = [
    {
      id: 'bumil',
      title: 'SPM 1: Ibu Hamil (Bumil)',
      desc: 'Pelayanan standar antenatal care (K1 - K6), buku KIA, tablet Fe',
      count: rekap.totalIbuHamil,
      subCount: `${rekap.totalBumilResti} Risti / KEK`,
      color: 'border-rose-300 bg-rose-50/50 text-rose-900',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Heart,
    },
    {
      id: 'balita-stunting',
      title: 'SPM 4: Balita & Stunting',
      desc: 'Pemantauan tumbuh kembang posyandu & deteksi dini stunting',
      count: rekap.totalBalitaStunting,
      subCount: `Dari ${rekap.totalBalita} balita`,
      color: 'border-amber-300 bg-amber-50/50 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Baby,
    },
    {
      id: 'hipertensi',
      title: 'SPM 8: Hipertensi (PTM)',
      desc: 'Skrining tekanan darah warga ≥ 15 tahun & Posbindu PTM',
      count: rekap.totalHipertensi,
      subCount: 'Kontrol rutin obat',
      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Activity,
    },
    {
      id: 'diabetes',
      title: 'SPM 9: Diabetes Melitus (DM)',
      desc: 'Pemeriksaan gula darah sewaktu & edukasi diet sehat',
      count: rekap.totalDiabetes,
      subCount: 'Pemantauan GDS',
      color: 'border-teal-300 bg-teal-50/50 text-teal-900',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: HeartPulse,
    },
    {
      id: 'tb',
      title: 'SPM 11: TB Paru (Menular)',
      desc: 'Pelayanan kesehatan terduga tuberkulosis & pengobatan OAT',
      count: rekap.totalTbParu,
      subCount: 'Penyakit Menular',
      color: 'border-cyan-300 bg-cyan-50/50 text-cyan-900',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      icon: ShieldAlert,
    },
    {
      id: 'odgj',
      title: 'SPM 10: ODGJ Berat',
      desc: 'Pelayanan orang dengan gangguan jiwa berat & pendampingan',
      count: rekap.totalOdgj,
      subCount: 'Dukungan keluarga',
      color: 'border-purple-300 bg-purple-50/50 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>Standar Pelayanan Minimal (SPM) Bidang Kesehatan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Pengawasan Penyakit Menular & Tidak Menular
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              12 Indikator SPM Kemenkes RI untuk pemantauan kesehatan warga Desa Kringa.
            </p>
          </div>
          <button
            onClick={onOpenReportTab}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs self-start sm:self-auto"
          >
            <span>Kirim Rekap ke WA / Kelurahan</span>
          </button>
        </div>
      </div>

      {/* Grid SPM Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {spmCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeCategory === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setActiveCategory(isSelected ? 'semua' : card.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  {card.count}
                </span>
                <span className="text-xs text-slate-500">{card.subCount}</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Patient Listing for Selected Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Pasien & Sasaran Pelayanan (
              {activeCategory === 'semua'
                ? 'Semua Kasus'
                : spmCards.find((c) => c.id === activeCategory)?.title || activeCategory}
              )
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredPatients.length} data warga yang memerlukan pemantauan nakes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pasien atau NIK..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {activeCategory !== 'semua' && (
              <button
                onClick={() => setActiveCategory('semua')}
                className="text-xs font-semibold text-emerald-700 hover:underline px-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Tidak ada pasien terdaftar untuk kategori ini atau pencarian tidak cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Nama Pasien / Warga</th>
                  <th className="py-2.5 px-3">Umur</th>
                  <th className="py-2.5 px-3">Wilayah Dusun</th>
                  <th className="py-2.5 px-3">Kategori SPM / Diagnosa</th>
                  <th className="py-2.5 px-3">Keterangan Medis & Obat</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(({ anggota, kk }, idx) => (
                  <tr key={`${anggota.id}-${idx}`} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{anggota.nama}</div>
                      <div className="font-mono text-[11px] text-slate-400">{anggota.nik}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatUmurDisplay(anggota.tanggalLahir)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{kk.dusun}</div>
                      <div className="text-[11px] text-slate-500">RT {kk.rt} / RW {kk.rw}</div>
                    </td>
                    <td className="py-3 px-3">
                      {anggota.ibuHamil?.isHamil && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                          Bumil {anggota.ibuHamil.statusRisiko}
                        </span>
                      )}
                      {anggota.balita && (anggota.balita.statusGizi === 'Stunting' || anggota.balita.statusGizi === 'Risiko Stunting') && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          {anggota.balita.statusGizi}
                        </span>
                      )}
                      {anggota.penyakitSpm?.hipertensi && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-medium mr-1">
                          Hipertensi ({anggota.penyakitSpm.tekananDarah || 'Rutin'})
                        </span>
                      )}
                      {anggota.penyakitSpm?.diabetesMelitus && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-medium mr-1">
                          DM
                        </span>
                      )}
                      {anggota.penyakitSpm?.tbParu && (
                        <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                          TB Paru
                        </span>
                      )}
                      {anggota.penyakitSpm?.odgjBerat && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                          ODGJ Berat
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {anggota.ibuHamil?.catatanHamil ||
                        anggota.penyakitSpm?.catatanKesehatan ||
                        (anggota.balita ? `BB: ${anggota.balita.beratBadanKg || '-'} kg, TB: ${anggota.balita.tinggiBadanCm || '-'} cm` : '-')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectKeluarga(kk)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-emerald-800 font-semibold ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka KK</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
