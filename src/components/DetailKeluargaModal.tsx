import React, { useState } from 'react';
import {
  Baby,
  Edit,
  Heart,
  HeartPulse,
  Home,
  MapPin,
  Printer,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { KartuKeluarga } from '../types';
import { formatUmurDisplay, getKategoriUsia } from '../utils/calculations';
import { printKartuKeluarga } from '../utils/printUtils';
import { NURSE_PROFILE } from '../utils/whatsapp';

interface DetailKeluargaModalProps {
  kk: KartuKeluarga | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (kk: KartuKeluarga) => void;
}

export const DetailKeluargaModal: React.FC<DetailKeluargaModalProps> = ({
  kk,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !kk) return null;

  const handlePrintKK = () => {
    setIsPrinting(true);
    try {
      printKartuKeluarga(kk);
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Kartu Kesehatan Keluarga (Family Folder)</h2>
              <div className="text-xs text-emerald-200 font-mono">
                No KK: {kk.noKK} · {kk.dusun}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintKK}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-70"
              title="Cetak Formulir Rekam Kesehatan Kartu Keluarga"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Mencetak...' : 'Cetak Form KK'}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(kk);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs print:p-8">
          {/* Official Letterhead for Print */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Pemerintah Kabupaten Sikka · Kecamatan Talibura
            </div>
            <div className="text-lg font-extrabold uppercase text-emerald-900">
              Pos Kesehatan Desa (Poskesdes) Kringa
            </div>
            <div className="text-[11px] text-slate-500">
              Wilayah Binaan: Dusun KRINGA · Dusun BOGANATAR · Dusun OGOLIDI
            </div>
            <div className="text-xs font-semibold text-slate-700 pt-1">
              FORMULIR REKAM KESEHATAN KELUARGA (PIS-PK / NAKES DESA)
            </div>
          </div>

          {/* KK Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Nomor Kartu Keluarga:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{kk.noKK}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kepala Keluarga:</span>
              <span className="font-bold text-slate-900 text-sm">{kk.kepalaKeluargaNama}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Dusun & Wilayah:</span>
              <span className="font-semibold text-emerald-800 text-xs">
                {kk.dusun}, RT {kk.rt} / RW {kk.rw}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sanitasi Lingkungan:</span>
              <span className="font-medium text-slate-800 text-xs">
                Jamban: {kk.jambanSehat ? 'Ya' : 'Belum'} · Air Bersih: {kk.saranaAirBersih ? 'Ya' : 'Belum'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 text-[11px]">Alamat Lengkap: </span>
              <span className="font-medium text-slate-800">{kk.alamat}</span>
            </div>
            {kk.fotoRumahUrl && (
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60 flex items-start gap-3">
                <img
                  src={kk.fotoRumahUrl}
                  alt="Dokumentasi Rumah"
                  className="w-28 h-20 rounded-xl object-cover border border-slate-300 shadow-xs shrink-0"
                />
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Dokumentasi Foto Rumah / Lingkungan</span>
                  <span className="text-slate-400 text-[10px]">Telah diverifikasi oleh Perawat Pembina Desa Kringa</span>
                </div>
              </div>
            )}
          </div>

          {/* Anggota Keluarga Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Daftar Anggota Keluarga ({kk.anggota.length} Jiwa)
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap & NIK</th>
                    <th className="py-2.5 px-3">Hubungan</th>
                    <th className="py-2.5 px-3">L/P</th>
                    <th className="py-2.5 px-3">Tgl Lahir / Umur</th>
                    <th className="py-2.5 px-3">Pekerjaan</th>
                    <th className="py-2.5 px-3">No BPJS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kk.anggota.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{a.nama}</div>
                        <div className="font-mono text-[11px] text-slate-500">{a.nik}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{a.hubungan}</td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3">
                        <div className="font-mono">{a.tanggalLahir}</div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          {formatUmurDisplay(a.tanggalLahir)} ({getKategoriUsia(a.tanggalLahir).split(' ')[0]})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{a.pekerjaan}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{a.noBpjs || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Status Kesehatan Khusus Tiap Anggota (Bumil, Balita, 12 SPM) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Catatan Kesehatan & Skrining 12 SPM Anggota Keluarga
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kk.anggota.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-bold text-slate-900">{a.nama} ({a.hubungan})</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatUmurDisplay(a.tanggalLahir)}
                    </span>
                  </div>

                  {/* Ibu Hamil */}
                  {a.ibuHamil?.isHamil && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-xs">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>Ibu Hamil: {a.ibuHamil.statusRisiko}</span>
                      </div>
                      <div className="text-[11px]">
                        Usia: {a.ibuHamil.usiaKehamilanMinggu} Minggu · Kunjungan: {a.ibuHamil.kunjunganAntenatal} · Buku KIA: {a.ibuHamil.bukuKia ? 'Ada' : 'Belum'} · Fe: {a.ibuHamil.minumFe ? 'Ya' : 'Tidak'}
                      </div>
                      {a.ibuHamil.catatanHamil && (
                        <div className="text-[10px] italic text-rose-800">
                          Catatan: {a.ibuHamil.catatanHamil}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Balita / Bayi */}
                  {a.balita && (
                    <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-xs">
                        <Baby className="w-3.5 h-3.5 text-teal-600" />
                        <span>Status Gizi Balita: {a.balita.statusGizi}</span>
                      </div>
                      <div className="text-[11px]">
                        BB: {a.balita.beratBadanKg || '-'} kg · TB: {a.balita.tinggiBadanCm || '-'} cm · Imunisasi: {a.balita.imunisasiLengkap ? 'Lengkap' : 'Belum'} · Posyandu: {a.balita.pantauPosyandu ? 'Rutin' : 'Jarang'}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Penyakit Menular / Tidak Menular */}
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.penyakitSpm?.hipertensi && (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                          Hipertensi ({a.penyakitSpm.tekananDarah || 'Kontrol'})
                        </span>
                      )}
                      {a.penyakitSpm?.diabetesMelitus && (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                          Diabetes Melitus
                        </span>
                      )}
                      {a.penyakitSpm?.tbParu && (
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold">
                          TB Paru (Pengobatan OAT)
                        </span>
                      )}
                      {a.penyakitSpm?.odgjBerat && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                          ODGJ Berat
                        </span>
                      )}
                      {a.penyakitSpm?.malaria && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">Malaria</span>
                      )}
                      {a.penyakitSpm?.merokok && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900">Perokok</span>
                      )}
                    </div>
                    {a.penyakitSpm?.catatanKesehatan && (
                      <div className="text-[10px] text-slate-500 italic mt-1">
                        "{a.penyakitSpm.catatanKesehatan}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signature block for Print */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-12">Kepala Keluarga</p>
              <p className="font-bold underline text-slate-900">
                ( {kk.kepalaKeluargaNama} )
              </p>
            </div>
            <div>
              <p className="text-slate-500">Desa Kringa, {new Date().toLocaleDateString('id-ID')}</p>
              <p className="text-slate-500 mb-12">Perawat Desa Kringa</p>
              <p className="font-bold underline text-slate-900">
                {NURSE_PROFILE.nama}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">STR: {NURSE_PROFILE.str}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 no-print shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrintKK}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-75"
            title="Cetak Formulir Rekam Kesehatan Kartu Keluarga"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Mempersiapkan Cetak...' : 'Cetak Formulir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
