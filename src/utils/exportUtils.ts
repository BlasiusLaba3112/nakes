import { AnggotaKeluarga, DusunName, KartuKeluarga } from '../types';
import { calculateAgeInMonths, calculateAgeInYears, getKategoriUsia } from './calculations';

export const CSV_HEADERS = [
  'No KK',
  'Dusun',
  'RT',
  'RW',
  'Alamat',
  'NIK',
  'Nama Lengkap',
  'Hubungan Keluarga',
  'Jenis Kelamin',
  'Tanggal Lahir',
  'Umur (Tahun)',
  'Umur (Bulan)',
  'Kategori Usia',
  'Status Kawin',
  'Pendidikan',
  'Pekerjaan',
  'Agama',
  'Gol Darah',
  'No BPJS',
  'No HP',
  'Ibu Hamil (Ya/Tidak)',
  'Usia Kehamilan (Minggu)',
  'Status Risiko Bumil',
  'Status Gizi Balita',
  'Imunisasi Balita',
  'Hipertensi',
  'Tekanan Darah',
  'Diabetes Melitus',
  'Gula Darah',
  'TB Paru',
  'ODGJ Berat',
  'Merokok',
  'Catatan Kesehatan',
];

/**
 * Format tanggal ke format Indonesia DD-MM-YYYY (misal: 19-03-1985)
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Singkat nama pendidikan untuk format tabel Excel
 */
export function formatPendidikanShort(pend: string): string {
  if (!pend) return 'SD';
  const p = pend.toLowerCase();
  if (p.includes('belum sekolah') || p.includes('tidak')) return 'Belum Sekolah';
  if (p.includes('sltp') || p.includes('smp')) return 'SLTP';
  if (p.includes('slta') || p.includes('sma') || p.includes('smk')) return 'SLTA';
  if (p.includes('s1') || p.includes('d4') || p.includes('sarjana')) return 'S1';
  if (p.includes('diploma') || p.includes('d3')) return 'D3';
  if (p.includes('sd')) return 'SD';
  return pend;
}

/**
 * Singkat nama pekerjaan untuk format tabel Excel
 */
export function formatPekerjaanShort(pek: string): string {
  if (!pek) return 'Petani';
  const p = pek.toLowerCase();
  if (p.includes('petani') || p.includes('kebun')) return 'Petani';
  if (p.includes('pelajar') || p.includes('siswa') || p.includes('mahasiswa')) return 'Pelajar';
  if (p.includes('belum')) return 'Belum Bekerja';
  if (p.includes('rumah tangga')) return 'Ibu Rumah Tangga';
  if (p.includes('nelayan')) return 'Nelayan';
  if (p.includes('wiraswasta') || p.includes('usaha')) return 'Wiraswasta';
  if (p.includes('pns') || p.includes('asn')) return 'PNS';
  if (p.includes('honorer') || p.includes('guru') || p.includes('nakes')) return 'Honorer';
  return pek;
}

/**
 * Ekspor data ke format Excel (.xls) PERSIS SESUAI GAMBAR (Capture.JPG):
 * - Judul Header Atas: RT/RW: 014/004
 * - Kolom: NO. KK | NO. | NAMA KK DAN ANGGOTA | TTL | AGAMA | JK | NO KK | NIK | PENDIDIKAM | PEKERJAAN
 * - Nomor KK & NIK diformat teks (mso-number-format) agar tidak menjadi notasi ilmiah (5.30708E+15)
 * - Baris kosong pemisah antar keluarga
 */
export function exportToExcelCaptureFormat(
  keluargaList: KartuKeluarga[],
  dusun: string = 'Semua',
  rt: string = 'Semua',
  rw: string = 'Semua'
): void {
  const filteredList = filterKeluargaByWilayah(keluargaList, dusun, rt, rw);

  // Format header RT/RW
  const displayRt = rt !== 'Semua' ? rt.padStart(3, '0') : '014';
  const displayRw = rw !== 'Semua' ? rw.padStart(3, '0') : '004';
  const headerRtRw = `RT/RW:${displayRt}/${displayRw}`;

  let tableHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Data Penduduk RT-RW</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
<style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
  th { background-color: #D9D9D9; border: 1px solid #000000; font-weight: bold; text-align: center; padding: 4px 6px; }
  td { border: 1px solid #000000; padding: 4px 6px; }
  .title-header { text-align: center; font-weight: bold; font-size: 13px; border: 1px solid #000000; background-color: #FFFFFF; }
  .text-cell { mso-number-format:"\\@"; }
  .center-cell { text-align: center; }
  .empty-row td { border-left: 1px solid #000000; border-right: 1px solid #000000; border-top: 1px solid #000000; border-bottom: 1px solid #000000; height: 18px; }
</style>
</head>
<body>
<table>
  <tr>
    <td colspan="10" class="title-header">${headerRtRw}</td>
  </tr>
  <tr>
    <th style="width: 50px;">NO. KK</th>
    <th style="width: 40px;">NO.</th>
    <th style="width: 220px; text-align: left;">NAMA KK DAN ANGGOTA</th>
    <th style="width: 170px; text-align: left;">TTL</th>
    <th style="width: 70px;">AGAMA</th>
    <th style="width: 35px;">JK</th>
    <th style="width: 150px;">NO KK</th>
    <th style="width: 150px;">NIK</th>
    <th style="width: 100px;">PENDIDIKAM</th>
    <th style="width: 110px;">PEKERJAAN</th>
  </tr>
`;

  filteredList.forEach((kk, kkIdx) => {
    const noKkUrut = kkIdx + 1;
    const dusunLabel = kk.dusun.replace('Dusun ', '').trim();

    kk.anggota.forEach((a, aIdx) => {
      const noAnggotaUrut = aIdx + 1;
      const ttl = `${dusunLabel}, ${formatDateIndo(a.tanggalLahir)}`;
      const jk = a.jenisKelamin === 'Perempuan' ? 'P' : 'L';
      const noKkVal = aIdx === 0 ? kk.noKK : '';
      const noKkIndexVal = aIdx === 0 ? noKkUrut : '';

      tableHtml += `
  <tr>
    <td class="center-cell">${noKkIndexVal}</td>
    <td class="center-cell">${noAnggotaUrut}</td>
    <td>${a.nama}</td>
    <td>${ttl}</td>
    <td class="center-cell">${a.agama || 'Katolik'}</td>
    <td class="center-cell">${jk}</td>
    <td class="text-cell">${noKkVal}</td>
    <td class="text-cell">${a.nik}</td>
    <td class="center-cell">${formatPendidikanShort(a.pendidikan)}</td>
    <td>${formatPekerjaanShort(a.pekerjaan)}</td>
  </tr>`;
    });

    // Baris kosong pemisah antar KK persis seperti di Capture.JPG
    tableHtml += `
  <tr class="empty-row">
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
  </tr>`;
  });

  tableHtml += `
</table>
</body>
</html>`;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const dusunSlug = dusun === 'Semua' ? 'SEMUA_DUSUN' : dusun.replace(/\s+/g, '_');
  const rtSlug = rt === 'Semua' ? 'RT014' : `RT${rt}`;
  const rwSlug = rw === 'Semua' ? 'RW004' : `RW${rw}`;
  const filename = `DATA_PENDUDUK_${dusunSlug}_${rtSlug}_${rwSlug}_FORMAT_RESMI.xls`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Filter data Kartu Keluarga berdasarkan Dusun, RT, dan RW
 */
export function filterKeluargaByWilayah(
  keluargaList: KartuKeluarga[],
  dusun: string = 'Semua',
  rt: string = 'Semua',
  rw: string = 'Semua'
): KartuKeluarga[] {
  return keluargaList.filter((kk) => {
    if (dusun !== 'Semua' && kk.dusun !== dusun) return false;
    if (rt !== 'Semua' && kk.rt !== rt) return false;
    if (rw !== 'Semua' && kk.rw !== rw) return false;
    return true;
  });
}

/**
 * Ekspor data KK & Penduduk ke CSV sesuai filter Dusun, RT, dan RW
 */
export function exportToCsv(
  keluargaList: KartuKeluarga[],
  dusun: string = 'Semua',
  rt: string = 'Semua',
  rw: string = 'Semua'
): void {
  const filteredList = filterKeluargaByWilayah(keluargaList, dusun, rt, rw);

  const rows: string[][] = [];

  filteredList.forEach((kk) => {
    kk.anggota.forEach((a) => {
      const months = calculateAgeInMonths(a.tanggalLahir);
      const years = calculateAgeInYears(a.tanggalLahir);
      const kategori = getKategoriUsia(a.tanggalLahir);

      rows.push([
        `"${kk.noKK}"`,
        `"${kk.dusun}"`,
        `"${kk.rt}"`,
        `"${kk.rw}"`,
        `"${kk.alamat.replace(/"/g, '""')}"`,
        `"${a.nik}"`,
        `"${a.nama.replace(/"/g, '""')}"`,
        `"${a.hubungan}"`,
        `"${a.jenisKelamin}"`,
        `"${a.tanggalLahir}"`,
        `${years}`,
        `${months}`,
        `"${kategori}"`,
        `"${a.statusKawin}"`,
        `"${a.pendidikan}"`,
        `"${a.pekerjaan}"`,
        `"${a.agama}"`,
        `"${a.golDarah}"`,
        `"${a.noBpjs || '-'}"`,
        `"${a.noHp || '-'}"`,
        `"${a.ibuHamil?.isHamil ? 'Ya' : 'Tidak'}"`,
        `"${a.ibuHamil?.usiaKehamilanMinggu || ''}"`,
        `"${a.ibuHamil?.statusRisiko || ''}"`,
        `"${a.balita?.statusGizi || ''}"`,
        `"${a.balita?.imunisasiLengkap ? 'Lengkap' : ''}"`,
        `"${a.penyakitSpm?.hipertensi ? 'Ya' : 'Tidak'}"`,
        `"${a.penyakitSpm?.tekananDarah || ''}"`,
        `"${a.penyakitSpm?.diabetesMelitus ? 'Ya' : 'Tidak'}"`,
        `"${a.penyakitSpm?.gulaDarahSewaktu || ''}"`,
        `"${a.penyakitSpm?.tbParu ? 'Ya' : 'Tidak'}"`,
        `"${a.penyakitSpm?.odgjBerat ? 'Ya' : 'Tidak'}"`,
        `"${a.penyakitSpm?.merokok ? 'Ya' : 'Tidak'}"`,
        `"${(a.penyakitSpm?.catatanKesehatan || '').replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [CSV_HEADERS.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

  const dusunSlug = dusun === 'Semua' ? 'SEMUA_DUSUN' : dusun.replace(/\s+/g, '_');
  const rtSlug = rt === 'Semua' ? 'ALL_RT' : `RT${rt}`;
  const rwSlug = rw === 'Semua' ? 'ALL_RW' : `RW${rw}`;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `DATA_PENDUDUK_${dusunSlug}_${rtSlug}_${rwSlug}_${dateStr}.csv`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Unduh Template CSV Kosong untuk diisi petugas/kader posyandu
 */
export function downloadCsvTemplate(targetDusun: string = 'Dusun KRINGA'): void {
  const sampleRows = [
    [
      '"5307041503080099"',
      `"${targetDusun}"`,
      '"01"',
      '"01"',
      `"Contoh Alamat ${targetDusun} RT 01 / RW 01"`,
      '"5307041205900001"',
      '"Contoh Nama Kepala Keluarga"',
      '"Kepala Keluarga"',
      '"Laki-laki"',
      '"1990-05-12"',
      '36',
      '432',
      '"Usia Produktif (15-59 Tahun)"',
      '"Kawin"',
      '"SLTA/Sederajat"',
      '"Petani/Pekebun"',
      '"Katolik"',
      '"O"',
      '"0001238472911"',
      '"081234567890"',
      '"Tidak"',
      '""',
      '""',
      '""',
      '""',
      '"Tidak"',
      '""',
      '"Tidak"',
      '""',
      '"Tidak"',
      '"Tidak"',
      '"Tidak"',
      '"Sehat, kontrol posyandu teratur"',
    ],
    [
      '"5307041503080099"',
      `"${targetDusun}"`,
      '"01"',
      '"01"',
      `"Contoh Alamat ${targetDusun} RT 01 / RW 01"`,
      '"5307045508930002"',
      '"Contoh Nama Istri"',
      '"Istri"',
      '"Perempuan"',
      '"1993-08-15"',
      '33',
      '396',
      '"Usia Produktif (15-59 Tahun)"',
      '"Kawin"',
      '"SLTA/Sederajat"',
      '"Ibu Rumah Tangga"',
      '"Katolik"',
      '"A"',
      '"0001238472912"',
      '"081234567891"',
      '"Ya"',
      '"16"',
      '"Normal"',
      '""',
      '""',
      '"Tidak"',
      '""',
      '"Tidak"',
      '""',
      '"Tidak"',
      '"Tidak"',
      '"Tidak"',
      '"Hamil trimester 2, rutin minum Fe"',
    ],
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [CSV_HEADERS.join(';'), ...sampleRows.map((r) => r.join(';'))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `TEMPLATE_DATA_PENDUDUK_DESA_KRINGA.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ekspor JSON Backup sesuai filter Dusun, RT, dan RW
 */
export function exportToJson(
  keluargaList: KartuKeluarga[],
  dusun: string = 'Semua',
  rt: string = 'Semua',
  rw: string = 'Semua'
): void {
  const filteredList = filterKeluargaByWilayah(keluargaList, dusun, rt, rw);
  const dusunSlug = dusun === 'Semua' ? 'SEMUA_DUSUN' : dusun.replace(/\s+/g, '_');
  const rtSlug = rt === 'Semua' ? 'ALL_RT' : `RT${rt}`;
  const rwSlug = rw === 'Semua' ? 'ALL_RW' : `RW${rw}`;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `BACKUP_DATABASE_KRINGA_${dusunSlug}_${rtSlug}_${rwSlug}_${dateStr}.json`;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredList, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parser file CSV ke daftar KartuKeluarga
 */
export function parseCsvToKeluargaList(
  csvText: string,
  overrideDusun?: DusunName,
  overrideRt?: string,
  overrideRw?: string
): { success: boolean; data: KartuKeluarga[]; error?: string } {
  try {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, data: [], error: 'Berkas CSV kosong atau tidak memiliki baris data.' };
    }

    // Detect delimiter (; or ,)
    const delimiter = lines[0].includes(';') ? ';' : ',';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const kkMap = new Map<string, KartuKeluarga>();

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < 7) continue;

      const rawNoKK = cols[0] || `530704${Date.now()}`;
      const rawDusun = (overrideDusun || cols[1] || 'Dusun KRINGA') as DusunName;
      const rawRt = overrideRt || cols[2] || '01';
      const rawRw = overrideRw || cols[3] || '01';
      const rawAlamat = cols[4] || `${rawDusun} RT ${rawRt} / RW ${rawRw}`;

      const rawNik = cols[5] || `530704${Date.now()}`;
      const rawNama = cols[6] || `Warga ${i}`;
      const rawHubungan = cols[7] || 'Kepala Keluarga';
      const rawJK = cols[8]?.toLowerCase().includes('perempuan') ? 'Perempuan' : 'Laki-laki';
      const rawTglLahir = cols[9] || '1995-01-01';
      const rawKawin = cols[13] || (rawHubungan === 'Anak' ? 'Belum Kawin' : 'Kawin');
      const rawPendidikan = cols[14] || 'SLTA/Sederajat';
      const rawPekerjaan = cols[15] || 'Petani/Pekebun';
      const rawAgama = cols[16] || 'Katolik';
      const rawGolDarah = cols[17] || 'O';
      const rawBpjs = cols[18] || '';
      const rawHp = cols[19] || '';

      const isHamil = cols[20]?.toLowerCase().includes('ya');
      const usiaHamil = parseInt(cols[21]) || 0;
      const risikoHamil = cols[22] || 'Normal';

      const statusGizi = cols[23] || 'Normal';
      const imunisasi = cols[24]?.toLowerCase().includes('lengkap');

      const hipertensi = cols[25]?.toLowerCase().includes('ya');
      const tekananDarah = cols[26] || '';
      const dm = cols[27]?.toLowerCase().includes('ya');
      const gds = parseInt(cols[28]) || 0;
      const tbParu = cols[29]?.toLowerCase().includes('ya');
      const odgj = cols[30]?.toLowerCase().includes('ya');
      const merokok = cols[31]?.toLowerCase().includes('ya');
      const catatan = cols[32] || '';

      const anggota: AnggotaKeluarga = {
        id: `ang-imp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        nik: rawNik,
        nama: rawNama,
        hubungan: rawHubungan as any,
        jenisKelamin: rawJK as any,
        tanggalLahir: rawTglLahir,
        agama: rawAgama as any,
        pendidikan: rawPendidikan,
        pekerjaan: rawPekerjaan,
        statusKawin: rawKawin as any,
        golDarah: rawGolDarah as any,
        noBpjs: rawBpjs,
        noHp: rawHp,
        ibuHamil: isHamil
          ? {
              isHamil: true,
              usiaKehamilanMinggu: usiaHamil,
              statusRisiko: risikoHamil as any,
              kunjunganAntenatal: 'K1',
              bukuKia: true,
              minumFe: true,
            }
          : undefined,
        balita: {
          statusGizi: statusGizi as any,
          imunisasiLengkap: imunisasi,
          pantauPosyandu: true,
        },
        penyakitSpm: {
          hipertensi,
          tekananDarah: tekananDarah || undefined,
          minumObatHipertensiTeratur: hipertensi,
          diabetesMelitus: dm,
          gulaDarahSewaktu: gds || undefined,
          minumObatDmTeratur: dm,
          tbParu,
          sedangPengobatanOat: tbParu,
          hivAids: false,
          odgjBerat: odgj,
          malaria: false,
          dbd: false,
          ispa: false,
          diare: false,
          kusta: false,
          asamUrat: false,
          kolesterol: false,
          jantung: false,
          stroke: false,
          merokok,
          catatanKesehatan: catatan,
        },
      };

      if (!kkMap.has(rawNoKK)) {
        kkMap.set(rawNoKK, {
          id: `kk-imp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          noKK: rawNoKK,
          dusun: rawDusun,
          rt: rawRt,
          rw: rawRw,
          alamat: rawAlamat,
          kepalaKeluargaNama: rawHubungan === 'Kepala Keluarga' ? rawNama : '',
          jambanSehat: true,
          saranaAirBersih: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          anggota: [anggota],
        });
      } else {
        const existingKK = kkMap.get(rawNoKK)!;
        existingKK.anggota.push(anggota);
        if (rawHubungan === 'Kepala Keluarga' || !existingKK.kepalaKeluargaNama) {
          existingKK.kepalaKeluargaNama = rawNama;
        }
      }
    }

    const result = Array.from(kkMap.values());
    result.forEach((kk) => {
      if (!kk.kepalaKeluargaNama && kk.anggota.length > 0) {
        kk.kepalaKeluargaNama = kk.anggota[0].nama;
      }
    });

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, data: [], error: err?.message || 'Gagal memproses berkas CSV.' };
  }
}
