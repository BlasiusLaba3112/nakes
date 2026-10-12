import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Baby,
  Calendar,
  Camera,
  Check,
  Heart,
  Image as ImageIcon,
  Plus,
  Stethoscope,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Agama,
  AnggotaKeluarga,
  DusunName,
  GolonganDarah,
  HubunganKeluarga,
  JenisKelamin,
  KartuKeluarga,
  StatusGiziBalita,
  StatusKawin,
  StatusRisikoHamil,
} from '../types';
import {
  DUSUN_LIST,
  calculateAgeInMonths,
  calculateAgeInYears,
  formatUmurDisplay,
  getKategoriUsia,
  isWus,
} from '../utils/calculations';

interface KartuKeluargaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kk: KartuKeluarga) => void;
  initialData?: KartuKeluarga | null;
}

const DEFAULT_ANGGOTA = (hubungan: HubunganKeluarga = 'Kepala Keluarga'): AnggotaKeluarga => ({
  id: `ang-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  nik: '',
  nama: '',
  hubungan,
  jenisKelamin: hubungan === 'Istri' ? 'Perempuan' : 'Laki-laki',
  tanggalLahir: '1990-01-01',
  agama: 'Katolik',
  pendidikan: 'SLTA/Sederajat',
  pekerjaan: 'Petani/Pekebun',
  statusKawin: hubungan === 'Anak' ? 'Belum Kawin' : 'Kawin',
  golDarah: 'O',
  noBpjs: '',
  noHp: '',
  penyakitSpm: {
    hipertensi: false,
    diabetesMelitus: false,
    tbParu: false,
    hivAids: false,
    odgjBerat: false,
    malaria: false,
    dbd: false,
    ispa: false,
    diare: false,
    kusta: false,
    asamUrat: false,
    kolesterol: false,
    jantung: false,
    stroke: false,
    merokok: false,
  },
});

export const KartuKeluargaFormModal: React.FC<KartuKeluargaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [noKK, setNoKK] = useState('');
  const [dusun, setDusun] = useState<DusunName>('Dusun KRINGA');
  const [rt, setRt] = useState('01');
  const [rw, setRw] = useState('01');
  const [alamat, setAlamat] = useState('');
  const [jambanSehat, setJambanSehat] = useState(true);
  const [saranaAirBersih, setSaranaAirBersih] = useState(true);
  const [fotoRumahUrl, setFotoRumahUrl] = useState<string>('');
  const [anggotaList, setAnggotaList] = useState<AnggotaKeluarga[]>([]);
  const [activeAnggotaIndex, setActiveAnggotaIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setNoKK(initialData.noKK);
      setDusun(initialData.dusun);
      setRt(initialData.rt);
      setRw(initialData.rw);
      setAlamat(initialData.alamat);
      setJambanSehat(initialData.jambanSehat ?? true);
      setSaranaAirBersih(initialData.saranaAirBersih ?? true);
      setFotoRumahUrl(initialData.fotoRumahUrl || '');
      setAnggotaList(JSON.parse(JSON.stringify(initialData.anggota)));
      setActiveAnggotaIndex(0);
    } else {
      setNoKK('');
      setDusun('Dusun KRINGA');
      setRt('01');
      setRw('01');
      setAlamat('Dusun Kringa RT 01 / RW 01');
      setJambanSehat(true);
      setSaranaAirBersih(true);
      setFotoRumahUrl('');
      setAnggotaList([DEFAULT_ANGGOTA('Kepala Keluarga')]);
      setActiveAnggotaIndex(0);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const currentAnggota = anggotaList[activeAnggotaIndex] || anggotaList[0];

  const updateCurrentAnggota = (patch: Partial<AnggotaKeluarga>) => {
    setAnggotaList((prev) => {
      const copy = [...prev];
      copy[activeAnggotaIndex] = { ...copy[activeAnggotaIndex], ...patch };
      return copy;
    });
  };

  const updateCurrentAnggotaSpm = (patch: Partial<AnggotaKeluarga['penyakitSpm']>) => {
    setAnggotaList((prev) => {
      const copy = [...prev];
      copy[activeAnggotaIndex] = {
        ...copy[activeAnggotaIndex],
        penyakitSpm: {
          ...copy[activeAnggotaIndex].penyakitSpm,
          ...patch,
        },
      };
      return copy;
    });
  };

  const addAnggota = () => {
    const newAng = DEFAULT_ANGGOTA(anggotaList.length === 1 ? 'Istri' : 'Anak');
    setAnggotaList((prev) => [...prev, newAng]);
    setActiveAnggotaIndex(anggotaList.length);
  };

  const removeAnggota = (idx: number) => {
    if (anggotaList.length <= 1) {
      alert('Kartu Keluarga minimal harus memiliki 1 anggota.');
      return;
    }
    setAnggotaList((prev) => prev.filter((_, i) => i !== idx));
    setActiveAnggotaIndex(Math.max(0, idx - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noKK.trim()) {
      setErrorMsg('Nomor Kartu Keluarga (KK) wajib diisi.');
      return;
    }
    if (noKK.trim().length < 10) {
      setErrorMsg('Nomor KK harus 16 digit sesuai standar Dukcapil.');
      return;
    }

    for (let i = 0; i < anggotaList.length; i++) {
      const a = anggotaList[i];
      if (!a.nama.trim()) {
        setErrorMsg(`Nama anggota ke-${i + 1} belum diisi.`);
        setActiveAnggotaIndex(i);
        return;
      }
      if (!a.tanggalLahir) {
        setErrorMsg(`Tanggal lahir untuk ${a.nama} belum ditentukan.`);
        setActiveAnggotaIndex(i);
        return;
      }
    }

    const kepala = anggotaList.find((a) => a.hubungan === 'Kepala Keluarga') || anggotaList[0];

    const kkData: KartuKeluarga = {
      id: initialData ? initialData.id : `kk-${Date.now()}`,
      noKK: noKK.trim(),
      dusun,
      rt: rt.trim() || '01',
      rw: rw.trim() || '01',
      alamat: alamat.trim() || `${dusun} RT ${rt} / RW ${rw}`,
      kepalaKeluargaNama: kepala.nama,
      jambanSehat,
      saranaAirBersih,
      fotoRumahUrl: fotoRumahUrl || undefined,
      anggota: anggotaList,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(kkData);
    onClose();
  };

  // Real-time calculation helpers for active member
  const currentMonths = calculateAgeInMonths(currentAnggota.tanggalLahir);
  const currentYears = calculateAgeInYears(currentAnggota.tanggalLahir);
  const currentKategori = getKategoriUsia(currentAnggota.tanggalLahir);
  const isBalitaOrBayi = currentMonths <= 60;
  const isEligibleWus = currentAnggota.jenisKelamin === 'Perempuan' && currentYears >= 15 && currentYears <= 49;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <Users className="w-4 h-4" />
              <span>Formulir Pendataan Resmi Kartu Keluarga (KK)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              {initialData ? 'Edit Data Kartu Keluarga' : 'Input Kartu Keluarga Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Data Kepala Keluarga & Alamat KK */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>01. Data Wilayah & Kartu Keluarga (KK)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Nomor Kartu Keluarga (16 Digit)*
                </label>
                <input
                  type="text"
                  value={noKK}
                  onChange={(e) => setNoKK(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="Contoh: 5307041503080001"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Pembagian Dusun (3 Dusun)*
                </label>
                <select
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value as DusunName)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  {DUSUN_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">RT*</label>
                  <input
                    type="text"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">RW*</label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Sanitasi Rumah
                </label>
                <div className="flex items-center gap-3 pt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jambanSehat}
                      onChange={(e) => setJambanSehat(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Jamban Sehat</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saranaAirBersih}
                      onChange={(e) => setSaranaAirBersih(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Air Bersih</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Alamat Lengkap / Keterangan Rumah
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: Jl. Trans Flores, Rt 01 / Rw 01 Dusun Kringa"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Upload Foto Rumah / Sanitasi Keluarga */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dokumentasi Foto Rumah / Jamban / Lingkungan (Upload Gambar Opsional)</span>
              </label>

              <div className="flex items-center gap-3 flex-wrap">
                {fotoRumahUrl ? (
                  <div className="relative group">
                    <img
                      src={fotoRumahUrl}
                      alt="Foto Rumah"
                      className="w-24 h-20 rounded-xl object-cover border border-slate-300 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoRumahUrl('')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-xs cursor-pointer"
                      title="Hapus Foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-800 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-xs">Pilih / Upload Foto Rumah</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setFotoRumahUrl(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
                <span className="text-[11px] text-slate-400">
                  Mendukung foto rumah, jamban sehat, atau kondisi lingkungan untuk arsip PIS-PK
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Anggota Keluarga Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>02. Anggota Keluarga Sesuai Kartu Keluarga ({anggotaList.length} Jiwa)</span>
              </h3>
              <button
                type="button"
                onClick={addAnggota}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Anggota</span>
              </button>
            </div>

            {/* Member Selector Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {anggotaList.map((a, idx) => {
                const isActive = idx === activeAnggotaIndex;
                return (
                  <button
                    key={a.id || idx}
                    type="button"
                    onClick={() => setActiveAnggotaIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {idx + 1}. {a.nama || `(Anggota ${idx + 1})`}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {a.hubungan}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Member Form Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-sm">
                    Data Individu: {currentAnggota.nama || `Anggota Ke-${activeAnggotaIndex + 1}`}
                  </span>
                </div>

                {anggotaList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAnggota(activeAnggotaIndex)}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Anggota Ini</span>
                  </button>
                )}
              </div>

              {/* Real-time Age Calculation Notification Banner */}
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-teal-900 font-medium">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>
                    Kalkulasi Otomatis Usia: <strong>{formatUmurDisplay(currentAnggota.tanggalLahir)}</strong> (
                    <span className="font-mono">{currentMonths} Bulan</span>)
                  </span>
                </div>
                <div className="text-teal-950 font-bold px-2.5 py-0.5 rounded-lg bg-teal-200/80 text-[11px]">
                  Kategori: {currentKategori}
                </div>
              </div>

              {/* Main fields of individual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    NIK (Nomor Induk Kependudukan - 16 Digit)*
                  </label>
                  <input
                    type="text"
                    value={currentAnggota.nik}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        nik: e.target.value.replace(/\D/g, '').slice(0, 16),
                      })
                    }
                    placeholder="Contoh: 5307041204680001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap*</label>
                  <input
                    type="text"
                    value={currentAnggota.nama}
                    onChange={(e) => updateCurrentAnggota({ nama: e.target.value })}
                    placeholder="Nama sesuai KTP/Akte"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Hubungan dalam Keluarga*
                  </label>
                  <select
                    value={currentAnggota.hubungan}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        hubungan: e.target.value as HubunganKeluarga,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Menantu">Menantu</option>
                    <option value="Cucu">Cucu</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jenis Kelamin*</label>
                  <select
                    value={currentAnggota.jenisKelamin}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        jenisKelamin: e.target.value as JenisKelamin,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tanggal Lahir*</label>
                  <input
                    type="date"
                    value={currentAnggota.tanggalLahir}
                    onChange={(e) =>
                      updateCurrentAnggota({ tanggalLahir: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status Perkawinan</label>
                  <select
                    value={currentAnggota.statusKawin}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        statusKawin: e.target.value as StatusKawin,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pekerjaan</label>
                  <select
                    value={currentAnggota.pekerjaan}
                    onChange={(e) => updateCurrentAnggota({ pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Petani/Pekebun">Petani/Pekebun</option>
                    <option value="Nelayan">Nelayan</option>
                    <option value="Wiraswasta">Wiraswasta</option>
                    <option value="PNS/ASN">PNS/ASN</option>
                    <option value="Honorer/Nakes/Guru">Honorer/Nakes/Guru</option>
                    <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                    <option value="Belum Bekerja">Belum Bekerja</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pendidikan Terakhir</label>
                  <select
                    value={currentAnggota.pendidikan}
                    onChange={(e) => updateCurrentAnggota({ pendidikan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                    <option value="Belum Tamat SD">Belum Tamat SD</option>
                    <option value="Tamat SD/Sederajat">Tamat SD/Sederajat</option>
                    <option value="SLTP/Sederajat">SLTP/Sederajat</option>
                    <option value="SLTA/Sederajat">SLTA/Sederajat</option>
                    <option value="Diploma I/II/III">Diploma I/II/III</option>
                    <option value="S1/D4">S1/D4</option>
                    <option value="S2">S2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Golongan Darah</label>
                  <select
                    value={currentAnggota.golDarah}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        golDarah: e.target.value as GolonganDarah,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="Tidak Tahu">Tidak Tahu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    No. BPJS / KIS Kesehatan
                  </label>
                  <input
                    type="text"
                    value={currentAnggota.noBpjs || ''}
                    onChange={(e) => updateCurrentAnggota({ noBpjs: e.target.value })}
                    placeholder="Contoh: 0001238472911"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={currentAnggota.noHp || ''}
                    onChange={(e) => updateCurrentAnggota({ noHp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Agama</label>
                  <select
                    value={currentAnggota.agama}
                    onChange={(e) =>
                      updateCurrentAnggota({
                        agama: e.target.value as Agama,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Katolik">Katolik</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Islam">Islam</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                  </select>
                </div>
              </div>

              {/* Conditional Sub-form A: IBU HAMIL (Inputan Manual sesuai brief) */}
              {isEligibleWus && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950">
                      <input
                        type="checkbox"
                        checked={currentAnggota.ibuHamil?.isHamil || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateCurrentAnggota({
                            ibuHamil: {
                              isHamil: checked,
                              usiaKehamilanMinggu: checked ? 12 : undefined,
                              statusRisiko: checked ? 'Normal' : undefined,
                              kunjunganAntenatal: checked ? 'K1' : undefined,
                              bukuKia: checked,
                              minumFe: checked,
                            },
                          });
                        }}
                        className="rounded text-rose-600 w-4 h-4"
                      />
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>Input Status Ibu Hamil (Bumil) untuk {currentAnggota.nama}</span>
                    </label>
                    <span className="text-[11px] text-rose-800 font-semibold">
                      Wanita Usia Subur (WUS)
                    </span>
                  </div>

                  {currentAnggota.ibuHamil?.isHamil && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-rose-200/60">
                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">
                          Usia Kehamilan (Minggu)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="42"
                          value={currentAnggota.ibuHamil.usiaKehamilanMinggu || ''}
                          onChange={(e) =>
                            updateCurrentAnggota({
                              ibuHamil: {
                                ...currentAnggota.ibuHamil!,
                                usiaKehamilanMinggu: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="Contoh: 20"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">
                          Status Risiko Kehamilan
                        </label>
                        <select
                          value={currentAnggota.ibuHamil.statusRisiko || 'Normal'}
                          onChange={(e) =>
                            updateCurrentAnggota({
                              ibuHamil: {
                                ...currentAnggota.ibuHamil!,
                                statusRisiko: e.target.value as StatusRisikoHamil,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-slate-800 font-semibold"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Resti / Risiko Tinggi">Resti / Risiko Tinggi</option>
                          <option value="KEK (Kurang Energi Kronis)">KEK (Kurang Energi Kronis)</option>
                          <option value="Anemia">Anemia</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">
                          Kunjungan Antenatal (K1-K6)
                        </label>
                        <select
                          value={currentAnggota.ibuHamil.kunjunganAntenatal || 'K1'}
                          onChange={(e) =>
                            updateCurrentAnggota({
                              ibuHamil: {
                                ...currentAnggota.ibuHamil!,
                                kunjunganAntenatal: e.target.value as any,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-slate-800"
                        >
                          <option value="K1">K1</option>
                          <option value="K2">K2</option>
                          <option value="K3">K3</option>
                          <option value="K4">K4</option>
                          <option value="K5">K5</option>
                          <option value="K6">K6</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentAnggota.ibuHamil.bukuKia || false}
                            onChange={(e) =>
                              updateCurrentAnggota({
                                ibuHamil: {
                                  ...currentAnggota.ibuHamil!,
                                  bukuKia: e.target.checked,
                                },
                              })
                            }
                            className="rounded text-rose-600"
                          />
                          <span>Punya Buku KIA</span>
                        </label>
                        <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentAnggota.ibuHamil.minumFe || false}
                            onChange={(e) =>
                              updateCurrentAnggota({
                                ibuHamil: {
                                  ...currentAnggota.ibuHamil!,
                                  minumFe: e.target.checked,
                                },
                              })
                            }
                            className="rounded text-rose-600"
                          />
                          <span>Minum Fe</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Sub-form B: BAYI (0-12 bln) & BALITA (12-60 bln) */}
              {isBalitaOrBayi && (
                <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-teal-950">
                      <Baby className="w-4 h-4 text-teal-700" />
                      <span>
                        Form Tumbuh Kembang & Gizi {currentMonths <= 12 ? 'Bayi' : 'Balita'} ({formatUmurDisplay(currentAnggota.tanggalLahir)})
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-800 font-semibold">
                      Standar Pelayanan Minimal (SPM 4)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-teal-200/60">
                    <div>
                      <label className="block text-teal-900 font-semibold mb-1">Status Gizi Balita</label>
                      <select
                        value={currentAnggota.balita?.statusGizi || 'Gizi Baik'}
                        onChange={(e) =>
                          updateCurrentAnggota({
                            balita: {
                              statusGizi: e.target.value as StatusGiziBalita,
                              imunisasiLengkap: currentAnggota.balita?.imunisasiLengkap ?? true,
                              pantauPosyandu: currentAnggota.balita?.pantauPosyandu ?? true,
                              beratBadanKg: currentAnggota.balita?.beratBadanKg,
                              tinggiBadanCm: currentAnggota.balita?.tinggiBadanCm,
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-teal-300 text-slate-800 font-semibold"
                      >
                        <option value="Gizi Baik">Gizi Baik</option>
                        <option value="Normal">Normal</option>
                        <option value="Risiko Stunting">Risiko Stunting</option>
                        <option value="Stunting">Stunting</option>
                        <option value="Gizi Kurang">Gizi Kurang</option>
                        <option value="Gizi Buruk">Gizi Buruk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-teal-900 font-semibold mb-1">Berat Badan (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentAnggota.balita?.beratBadanKg || ''}
                        onChange={(e) =>
                          updateCurrentAnggota({
                            balita: {
                              statusGizi: currentAnggota.balita?.statusGizi || 'Gizi Baik',
                              imunisasiLengkap: currentAnggota.balita?.imunisasiLengkap ?? true,
                              pantauPosyandu: currentAnggota.balita?.pantauPosyandu ?? true,
                              beratBadanKg: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="Contoh: 12.4"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-teal-300 font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-teal-900 font-semibold mb-1">Tinggi / PB (Cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentAnggota.balita?.tinggiBadanCm || ''}
                        onChange={(e) =>
                          updateCurrentAnggota({
                            balita: {
                              statusGizi: currentAnggota.balita?.statusGizi || 'Gizi Baik',
                              imunisasiLengkap: currentAnggota.balita?.imunisasiLengkap ?? true,
                              pantauPosyandu: currentAnggota.balita?.pantauPosyandu ?? true,
                              tinggiBadanCm: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="Contoh: 85.0"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-teal-300 font-mono text-slate-800"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentAnggota.balita?.imunisasiLengkap ?? true}
                          onChange={(e) =>
                            updateCurrentAnggota({
                              balita: {
                                statusGizi: currentAnggota.balita?.statusGizi || 'Gizi Baik',
                                imunisasiLengkap: e.target.checked,
                                pantauPosyandu: currentAnggota.balita?.pantauPosyandu ?? true,
                              },
                            })
                          }
                          className="rounded text-teal-600"
                        />
                        <span>Imunisasi Lengkap</span>
                      </label>
                      <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentAnggota.balita?.pantauPosyandu ?? true}
                          onChange={(e) =>
                            updateCurrentAnggota({
                              balita: {
                                statusGizi: currentAnggota.balita?.statusGizi || 'Gizi Baik',
                                imunisasiLengkap: currentAnggota.balita?.imunisasiLengkap ?? true,
                                pantauPosyandu: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-teal-600"
                        />
                        <span>Rutin Posyandu</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-form C: PENYAKIT MENULAR & TIDAK MENULAR SESUAI 12 SPM */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                    <span>Skrining Penyakit Menular & Tidak Menular (12 SPM Kesehatan)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Desa Kringa</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {/* Hipertensi */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.hipertensi || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ hipertensi: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Hipertensi (PTM)</span>
                    </label>
                    {currentAnggota.penyakitSpm?.hipertensi && (
                      <input
                        type="text"
                        placeholder="Tensi: 140/90"
                        value={currentAnggota.penyakitSpm.tekananDarah || ''}
                        onChange={(e) => updateCurrentAnggotaSpm({ tekananDarah: e.target.value })}
                        className="mt-1.5 w-full px-2 py-1 text-[11px] rounded border border-slate-300 font-mono"
                      />
                    )}
                  </div>

                  {/* Diabetes Melitus */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.diabetesMelitus || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ diabetesMelitus: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Diabetes Melitus</span>
                    </label>
                    {currentAnggota.penyakitSpm?.diabetesMelitus && (
                      <input
                        type="number"
                        placeholder="GDS mg/dL: 200"
                        value={currentAnggota.penyakitSpm.gulaDarahSewaktu || ''}
                        onChange={(e) =>
                          updateCurrentAnggotaSpm({ gulaDarahSewaktu: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1.5 w-full px-2 py-1 text-[11px] rounded border border-slate-300 font-mono"
                      />
                    )}
                  </div>

                  {/* TB Paru (Penyakit Menular) */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.tbParu || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ tbParu: e.target.checked })}
                        className="rounded text-teal-600"
                      />
                      <span>TB Paru (Menular)</span>
                    </label>
                    {currentAnggota.penyakitSpm?.tbParu && (
                      <label className="mt-1.5 flex items-center gap-1 text-[10px] text-teal-800 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentAnggota.penyakitSpm.sedangPengobatanOat ?? true}
                          onChange={(e) =>
                            updateCurrentAnggotaSpm({ sedangPengobatanOat: e.target.checked })
                          }
                          className="rounded text-teal-600"
                        />
                        <span>Pengobatan OAT</span>
                      </label>
                    )}
                  </div>

                  {/* ODGJ Berat */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.odgjBerat || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ odgjBerat: e.target.checked })}
                        className="rounded text-purple-600"
                      />
                      <span>ODGJ Berat</span>
                    </label>
                    {currentAnggota.penyakitSpm?.odgjBerat && (
                      <span className="text-[10px] text-purple-700 block mt-1">Konseling PKM</span>
                    )}
                  </div>

                  {/* Malaria */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.malaria || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ malaria: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Malaria</span>
                    </label>
                  </div>

                  {/* DBD */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.dbd || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ dbd: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>DBD</span>
                    </label>
                  </div>

                  {/* ISPA */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.ispa || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ ispa: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>ISPA / Batuk Pilek</span>
                    </label>
                  </div>

                  {/* Diare */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.diare || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ diare: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Diare</span>
                    </label>
                  </div>

                  {/* Asam Urat */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.asamUrat || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ asamUrat: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Asam Urat</span>
                    </label>
                  </div>

                  {/* Kolesterol */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.kolesterol || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ kolesterol: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>Kolesterol</span>
                    </label>
                  </div>

                  {/* Merokok */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={currentAnggota.penyakitSpm?.merokok || false}
                        onChange={(e) => updateCurrentAnggotaSpm({ merokok: e.target.checked })}
                        className="rounded text-amber-600"
                      />
                      <span>Merokok / Tembakau</span>
                    </label>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={currentAnggota.penyakitSpm?.catatanKesehatan || ''}
                    onChange={(e) => updateCurrentAnggotaSpm({ catatanKesehatan: e.target.value })}
                    placeholder="Catatan medis tambahan nakes (misal: riwayat obat, keluhan, tanggal kunjungan)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Data Kartu Keluarga</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
