import {
  AnggotaKeluarga,
  DusunName,
  DusunSummary,
  KategoriUsia,
  KartuKeluarga,
  RekapitulasiKesehatan,
} from '../types';

export const DUSUN_LIST: DusunName[] = [
  'Dusun KRINGA',
  'Dusun BOGANATAR',
  'Dusun OGOLIDI',
];

/**
 * Menghitung umur dalam bulan secara akurat dari tanggal lahir
 */
export function calculateAgeInMonths(birthdateStr: string, referenceDate: Date = new Date()): number {
  if (!birthdateStr) return 0;
  const birth = new Date(birthdateStr);
  if (isNaN(birth.getTime())) return 0;

  let months = (referenceDate.getFullYear() - birth.getFullYear()) * 12;
  months += referenceDate.getMonth() - birth.getMonth();

  if (referenceDate.getDate() < birth.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Menghitung umur dalam tahun dari tanggal lahir
 */
export function calculateAgeInYears(birthdateStr: string, referenceDate: Date = new Date()): number {
  if (!birthdateStr) return 0;
  const birth = new Date(birthdateStr);
  if (isNaN(birth.getTime())) return 0;

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Format umur ramah baca: misal "7 Bulan", "2 Tahun 4 Bulan", "45 Tahun"
 */
export function formatUmurDisplay(birthdateStr: string): string {
  const months = calculateAgeInMonths(birthdateStr);
  const years = calculateAgeInYears(birthdateStr);

  if (months <= 12) {
    return `${months} Bulan`;
  }
  if (months < 60) {
    const remMonths = months % 12;
    return remMonths > 0 ? `${years} Thn ${remMonths} Bln` : `${years} Tahun`;
  }
  return `${years} Tahun`;
}

/**
 * Mendapatkan Kategori Usia sesuai pedoman Kemenkes & Permintaan User:
 * - BAYI: 0 s.d 12 bulan (<= 12 bulan)
 * - BALITA: > 12 s.d 60 bulan
 * - Remaja: 10 s.d 18 tahun
 * - Usia Produktif: 15 s.d 59 tahun
 * - Lansia: >= 60 tahun
 */
export function getKategoriUsia(birthdateStr: string): KategoriUsia {
  const months = calculateAgeInMonths(birthdateStr);
  const years = calculateAgeInYears(birthdateStr);

  if (months <= 12) {
    return 'Bayi (0-12 Bulan)';
  }
  if (months > 12 && months <= 60) {
    return 'Balita (12-60 Bulan)';
  }
  if (years >= 60) {
    return 'Lansia (>=60 Tahun)';
  }
  if (years >= 10 && years <= 18) {
    return 'Remaja (10-18 Tahun)';
  }
  if (years >= 15 && years < 60) {
    return 'Usia Produktif (15-59 Tahun)';
  }
  return 'Anak (5-9 Tahun)';
}

/**
 * Cek apakah seorang warga adalah Wanita Usia Subur (WUS)
 * Kriteria: Perempuan, usia 15 - 49 tahun
 */
export function isWus(anggota: AnggotaKeluarga): boolean {
  if (anggota.jenisKelamin !== 'Perempuan') return false;
  const years = calculateAgeInYears(anggota.tanggalLahir);
  return years >= 15 && years <= 49;
}

/**
 * Menghitung Pasangan Usia Subur (PUS) dalam satu keluarga
 * Kriteria: Pasangan suami-istri sah dengan istri berusia 15 - 49 tahun
 */
export function countPusInKeluarga(kk: KartuKeluarga): number {
  const adaSuami = kk.anggota.some(
    (a) => a.jenisKelamin === 'Laki-laki' && a.statusKawin === 'Kawin'
  );
  const istriSubur = kk.anggota.filter(
    (a) => a.jenisKelamin === 'Perempuan' && a.statusKawin === 'Kawin' && isWus(a)
  );

  return adaSuami && istriSubur.length > 0 ? istriSubur.length : 0;
}

/**
 * Kalkulasi seluruh ringkasan kesehatan & demografi real-time
 */
export function calculateRekapitulasi(
  keluargaList: KartuKeluarga[],
  filterDusun?: DusunName | 'Semua',
  filterRt?: string | 'Semua'
): RekapitulasiKesehatan {
  const filtered = keluargaList.filter((kk) => {
    if (filterDusun && filterDusun !== 'Semua' && kk.dusun !== filterDusun) {
      return false;
    }
    if (filterRt && filterRt !== 'Semua' && kk.rt !== filterRt) {
      return false;
    }
    return true;
  });

  const rekap: RekapitulasiKesehatan = {
    totalKK: filtered.length,
    totalPenduduk: 0,
    totalLakiLaki: 0,
    totalPerempuan: 0,
    totalBayi: 0,
    totalBalita: 0,
    totalAnakSekolah: 0,
    totalRemaja: 0,
    totalUsiaProduktif: 0,
    totalLansia: 0,
    totalLansiaLaki: 0,
    totalLansiaPerempuan: 0,
    totalPus: 0,
    totalWus: 0,
    totalIbuHamil: 0,
    totalBumilResti: 0,
    totalBalitaStunting: 0,
    totalBalitaGiziKurang: 0,
    totalBalitaImunisasiLengkap: 0,
    totalHipertensi: 0,
    totalDiabetes: 0,
    totalTbParu: 0,
    totalHiv: 0,
    totalOdgj: 0,
    totalMalaria: 0,
    totalDbd: 0,
    totalIspa: 0,
    totalDiare: 0,
    totalPerokok: 0,
    totalBpjs: 0,
  };

  filtered.forEach((kk) => {
    rekap.totalPus += countPusInKeluarga(kk);

    kk.anggota.forEach((a) => {
      rekap.totalPenduduk++;
      if (a.jenisKelamin === 'Laki-laki') rekap.totalLakiLaki++;
      if (a.jenisKelamin === 'Perempuan') rekap.totalPerempuan++;

      const months = calculateAgeInMonths(a.tanggalLahir);
      const years = calculateAgeInYears(a.tanggalLahir);

      // Kategori usia
      if (months <= 12) {
        rekap.totalBayi++;
      } else if (months > 12 && months <= 60) {
        rekap.totalBalita++;
      } else if (years >= 5 && years < 10) {
        rekap.totalAnakSekolah++;
      }

      if (years >= 10 && years <= 18) {
        rekap.totalRemaja++;
      }

      if (years >= 15 && years < 60) {
        rekap.totalUsiaProduktif++;
      }

      if (years >= 60) {
        rekap.totalLansia++;
        if (a.jenisKelamin === 'Laki-laki') {
          rekap.totalLansiaLaki++;
        } else {
          rekap.totalLansiaPerempuan++;
        }
      }

      // WUS & Bumil
      if (isWus(a)) {
        rekap.totalWus++;
      }

      if (a.ibuHamil?.isHamil) {
        rekap.totalIbuHamil++;
        if (
          a.ibuHamil.statusRisiko === 'Resti / Risiko Tinggi' ||
          a.ibuHamil.statusRisiko === 'KEK (Kurang Energi Kronis)' ||
          a.ibuHamil.statusRisiko === 'Anemia'
        ) {
          rekap.totalBumilResti++;
        }
      }

      // Balita & Gizi
      if (a.balita) {
        if (a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting') {
          rekap.totalBalitaStunting++;
        }
        if (a.balita.statusGizi === 'Gizi Kurang' || a.balita.statusGizi === 'Gizi Buruk') {
          rekap.totalBalitaGiziKurang++;
        }
        if (a.balita.imunisasiLengkap) {
          rekap.totalBalitaImunisasiLengkap++;
        }
      }

      // Penyakit SPM
      if (a.penyakitSpm) {
        if (a.penyakitSpm.hipertensi) rekap.totalHipertensi++;
        if (a.penyakitSpm.diabetesMelitus) rekap.totalDiabetes++;
        if (a.penyakitSpm.tbParu) rekap.totalTbParu++;
        if (a.penyakitSpm.hivAids) rekap.totalHiv++;
        if (a.penyakitSpm.odgjBerat) rekap.totalOdgj++;
        if (a.penyakitSpm.malaria) rekap.totalMalaria++;
        if (a.penyakitSpm.dbd) rekap.totalDbd++;
        if (a.penyakitSpm.ispa) rekap.totalIspa++;
        if (a.penyakitSpm.diare) rekap.totalDiare++;
        if (a.penyakitSpm.merokok) rekap.totalPerokok++;
      }

      if (a.noBpjs && a.noBpjs.trim() !== '' && a.noBpjs.toLowerCase() !== 'tidak ada') {
        rekap.totalBpjs++;
      }
    });
  });

  return rekap;
}

/**
 * Ringkasan data terpisah untuk 3 dusun: Dusun KRINGA, Dusun BOGANATAR, Dusun OGOLIDI
 */
export function calculateDusunSummaries(keluargaList: KartuKeluarga[]): DusunSummary[] {
  return DUSUN_LIST.map((dusun) => {
    const kks = keluargaList.filter((k) => k.dusun === dusun);
    let totalJiwa = 0;
    let lakiLaki = 0;
    let perempuan = 0;
    let bayi = 0;
    let balita = 0;
    let lansia = 0;
    let ibuHamil = 0;
    let bumilResti = 0;
    let hipertensi = 0;
    let diabetes = 0;
    let tbParu = 0;
    let stunting = 0;

    kks.forEach((kk) => {
      kk.anggota.forEach((a) => {
        totalJiwa++;
        if (a.jenisKelamin === 'Laki-laki') lakiLaki++;
        if (a.jenisKelamin === 'Perempuan') perempuan++;

        const months = calculateAgeInMonths(a.tanggalLahir);
        const years = calculateAgeInYears(a.tanggalLahir);

        if (months <= 12) bayi++;
        if (months > 12 && months <= 60) balita++;
        if (years >= 60) lansia++;

        if (a.ibuHamil?.isHamil) {
          ibuHamil++;
          if (
            a.ibuHamil.statusRisiko === 'Resti / Risiko Tinggi' ||
            a.ibuHamil.statusRisiko === 'KEK (Kurang Energi Kronis)'
          ) {
            bumilResti++;
          }
        }

        if (a.balita && (a.balita.statusGizi === 'Stunting' || a.balita.statusGizi === 'Risiko Stunting')) {
          stunting++;
        }

        if (a.penyakitSpm?.hipertensi) hipertensi++;
        if (a.penyakitSpm?.diabetesMelitus) diabetes++;
        if (a.penyakitSpm?.tbParu) tbParu++;
      });
    });

    return {
      dusun,
      totalKK: kks.length,
      totalJiwa,
      lakiLaki,
      perempuan,
      bayi,
      balita,
      lansia,
      ibuHamil,
      bumilResti,
      hipertensi,
      diabetes,
      tbParu,
      stunting,
    };
  });
}
