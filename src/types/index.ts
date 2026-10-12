export type DusunName = 'Dusun KRINGA' | 'Dusun BOGANATAR' | 'Dusun OGOLIDI';

export type HubunganKeluarga =
  | 'Kepala Keluarga'
  | 'Istri'
  | 'Anak'
  | 'Orang Tua'
  | 'Mertua'
  | 'Menantu'
  | 'Cucu'
  | 'Famili Lain';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type StatusKawin = 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';

export type GolonganDarah = 'A' | 'B' | 'AB' | 'O' | 'Tidak Tahu';

export type Agama = 'Katolik' | 'Kristen' | 'Islam' | 'Hindu' | 'Buddha' | 'Konghucu';

export type KategoriUsia =
  | 'Bayi (0-12 Bulan)'
  | 'Balita (12-60 Bulan)'
  | 'Anak (5-9 Tahun)'
  | 'Remaja (10-18 Tahun)'
  | 'Usia Produktif (15-59 Tahun)'
  | 'Lansia (>=60 Tahun)';

export type StatusGiziBalita = 'Gizi Baik' | 'Gizi Kurang' | 'Gizi Buruk' | 'Risiko Stunting' | 'Stunting' | 'Normal';

export type StatusRisikoHamil = 'Normal' | 'Resti / Risiko Tinggi' | 'KEK (Kurang Energi Kronis)' | 'Anemia';

export interface DataIbuHamil {
  isHamil: boolean;
  usiaKehamilanMinggu?: number;
  hpht?: string; // Hari Pertama Haid Terakhir (YYYY-MM-DD)
  taksiranPersalinan?: string; // HPL (YYYY-MM-DD)
  statusRisiko?: StatusRisikoHamil;
  kunjunganAntenatal?: 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6';
  bukuKia?: boolean;
  minumFe?: boolean;
  catatanHamil?: string;
}

export interface DataBalita {
  statusGizi: StatusGiziBalita;
  imunisasiLengkap: boolean;
  pantauPosyandu: boolean;
  asiEksklusif?: boolean;
  vitA?: boolean;
  beratBadanKg?: number;
  tinggiBadanCm?: number;
}

export interface DataPenyakitSPM {
  // 12 SPM Kesehatan & Penyakit Menular / Tidak Menular
  hipertensi: boolean;
  tekananDarah?: string; // misal "140/90"
  minumObatHipertensiTeratur?: boolean;

  diabetesMelitus: boolean;
  gulaDarahSewaktu?: number; // mg/dL
  minumObatDmTeratur?: boolean;

  tbParu: boolean; // Penyakit Menular (Tuberkulosis)
  sedangPengobatanOat?: boolean;

  hivAids: boolean; // Penyakit Menular
  dalamPengobatanArv?: boolean;

  odgjBerat: boolean; // Orang Dengan Gangguan Jiwa Berat
  rutinKonselingObat?: boolean;

  // Penyakit menular lainnya (endemik lokal)
  malaria: boolean;
  dbd: boolean;
  ispa: boolean;
  diare: boolean;
  kusta: boolean;

  // Penyakit tidak menular lainnya
  asamUrat: boolean;
  kolesterol: boolean;
  jantung: boolean;
  stroke: boolean;

  merokok: boolean;
  catatanKesehatan?: string;
}

export interface AnggotaKeluarga {
  id: string;
  nik: string; // 16 digit
  nama: string;
  hubungan: HubunganKeluarga;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Agama;
  pendidikan: string;
  pekerjaan: string;
  statusKawin: StatusKawin;
  golDarah: GolonganDarah;
  noBpjs: string; // Nomor KIS/BPJS atau 'Tidak Ada'
  noHp?: string;
  fotoProfilUrl?: string; // Foto individu/pasien (opsional)

  // Data Kesehatan Tambahan
  ibuHamil?: DataIbuHamil;
  balita?: DataBalita;
  penyakitSpm: DataPenyakitSPM;

  catatanKhusus?: string;
}

export interface KartuKeluarga {
  id: string;
  noKK: string; // 16 digit
  dusun: DusunName;
  rt: string; // e.g. "01"
  rw: string; // e.g. "01"
  alamat: string;
  kepalaKeluargaNama: string; // Helper cache
  jambanSehat: boolean;
  saranaAirBersih: boolean;
  fotoRumahUrl?: string; // Dokumentasi foto rumah / lingkungan keluarga (opsional)
  anggota: AnggotaKeluarga[];
  createdAt: string;
  updatedAt: string;
}

export interface RekapitulasiKesehatan {
  totalKK: number;
  totalPenduduk: number;
  totalLakiLaki: number;
  totalPerempuan: number;

  // Kelompok Usia Real-Time
  totalBayi: number; // 0-12 bulan
  totalBalita: number; // 12-60 bulan
  totalAnakSekolah: number; // 5-9 tahun
  totalRemaja: number; // 10-18 tahun
  totalUsiaProduktif: number; // 15-59 tahun
  totalLansia: number; // >= 60 tahun
  totalLansiaLaki: number;
  totalLansiaPerempuan: number;

  // Reproduksi
  totalPus: number; // Pasangan Usia Subur
  totalWus: number; // Wanita Usia Subur (15-49 tahun)
  totalIbuHamil: number;
  totalBumilResti: number;

  // Balita & Gizi
  totalBalitaStunting: number;
  totalBalitaGiziKurang: number;
  totalBalitaImunisasiLengkap: number;

  // 12 SPM & Penyakit
  totalHipertensi: number;
  totalDiabetes: number;
  totalTbParu: number;
  totalHiv: number;
  totalOdgj: number;
  totalMalaria: number;
  totalDbd: number;
  totalIspa: number;
  totalDiare: number;
  totalPerokok: number;
  totalBpjs: number;
}

export interface DusunSummary {
  dusun: DusunName;
  totalKK: number;
  totalJiwa: number;
  lakiLaki: number;
  perempuan: number;
  bayi: number;
  balita: number;
  lansia: number;
  ibuHamil: number;
  bumilResti: number;
  hipertensi: number;
  diabetes: number;
  tbParu: number;
  stunting: number;
}
