import { DusunSummary, KartuKeluarga, RekapitulasiKesehatan } from '../types';
import { calculateDusunSummaries, calculateRekapitulasi } from './calculations';

export const TARGET_WA_NUMBER = '+6281337401814';
export const CLEAN_WA_NUMBER = '6281337401814';

export const NURSE_PROFILE = {
  nama: 'Gabriela Ana Lewar, S.Kep., Ns.',
  jabatan: 'Penanggung Jawab Perawat Desa Kringa',
  poskesdes: 'Poskesdes Kringa / PKM Boganatar',
  desa: 'Desa Kringa, Kec. Talibura, Kab. Sikka',
  str: '19890412 201503 2 004',
  telepon: '+6281337401814',
  avatar: '/src/assets/images/nurse_gabriela_lewar_1791211252947.jpg',
};

/**
 * Format laporan resmi berbasis teks WhatsApp
 */
export function generateWhatsAppReportText(
  keluargaList: KartuKeluarga[],
  periode: string = 'Laporan Berkala Nakes'
): string {
  const rekap: RekapitulasiKesehatan = calculateRekapitulasi(keluargaList);
  const dusunList: DusunSummary[] = calculateDusunSummaries(keluargaList);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let message = `🏥 *LAPORAN REKAPITULASI KESEHATAN WARGA DESA KRINGA*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *Periode:* ${periode}\n`;
  message += `📅 *Tanggal:* ${dateFormatted}\n`;
  message += `👩‍⚕️ *Nakes Pembina:* ${NURSE_PROFILE.nama}\n`;
  message += `📍 *Wilayah Binaan:* Desa Kringa (3 Dusun: Kringa, Boganatar, Ogolidi)\n\n`;

  message += `📊 *1. REKAPITULASI DATA PENDUDUK*\n`;
  message += `• Total Kepala Keluarga (KK): *${rekap.totalKK} KK*\n`;
  message += `• Total Penduduk (Jiwa): *${rekap.totalPenduduk} Jiwa*\n`;
  message += `  - Laki-laki: ${rekap.totalLakiLaki} Jiwa\n`;
  message += `  - Perempuan: ${rekap.totalPerempuan} Jiwa\n\n`;

  message += `🏘️ *2. RINCIAN PER DUSUN & PEMETAAN WILAYAH*\n`;
  dusunList.forEach((d, idx) => {
    message += `*${idx + 1}. ${d.dusun}*\n`;
    message += `   - Jumlah KK: ${d.totalKK} KK | Total Jiwa: ${d.totalJiwa}\n`;
    message += `   - Bayi (0-12 bln): ${d.bayi} | Balita (1-5 thn): ${d.balita}\n`;
    message += `   - Lansia: ${d.lansia} | Bumil: ${d.ibuHamil} (${d.bumilResti} Risti)\n`;
    message += `   - Kasus PTM/PM: Hipertensi (${d.hipertensi}), DM (${d.diabetes}), TB (${d.tbParu})\n`;
  });
  message += `\n`;

  message += `👶 *3. KELOMPOK USIA & SASARAN KESEHATAN (REAL-TIME)*\n`;
  message += `• Bayi (0 - 12 Bulan): *${rekap.totalBayi} Bayi*\n`;
  message += `• Balita (12 - 60 Bulan): *${rekap.totalBalita} Balita*\n`;
  message += `  - Balita Risiko Stunting: *${rekap.totalBalitaStunting} Balita*\n`;
  message += `  - Imunisasi Dasar Lengkap: ${rekap.totalBalitaImunisasiLengkap} Balita\n`;
  message += `• Remaja (10 - 18 Tahun): *${rekap.totalRemaja} Orang*\n`;
  message += `• Usia Produktif (15 - 59 Tahun): *${rekap.totalUsiaProduktif} Orang*\n`;
  message += `• Lansia (>= 60 Tahun): *${rekap.totalLansia} Orang*\n`;
  message += `  - Lansia Laki-laki: ${rekap.totalLansiaLaki} Orang\n`;
  message += `  - Lansia Perempuan: ${rekap.totalLansiaPerempuan} Orang\n\n`;

  message += `🤰 *4. KESEHATAN IBU & REPRODUKSI*\n`;
  message += `• Pasangan Usia Subur (PUS): *${rekap.totalPus} Pasang*\n`;
  message += `• Wanita Usia Subur (WUS): *${rekap.totalWus} Orang*\n`;
  message += `• Total Ibu Hamil: *${rekap.totalIbuHamil} Orang*\n`;
  message += `• Ibu Hamil Risiko Tinggi / KEK: *${rekap.totalBumilResti} Orang*\n\n`;

  message += `🩺 *5. INDIKATOR 12 SPM & PENYAKIT PRIORITAS*\n`;
  message += `• Penderita Hipertensi: *${rekap.totalHipertensi} Orang*\n`;
  message += `• Penderita Diabetes Melitus: *${rekap.totalDiabetes} Orang*\n`;
  message += `• Terduga / Kasus TB Paru: *${rekap.totalTbParu} Orang*\n`;
  message += `• Kasus ODGJ Berat: *${rekap.totalOdgj} Orang*\n`;
  message += `• Kasus Malaria / DBD: *${rekap.totalMalaria + rekap.totalDbd} Orang*\n`;
  message += `• Kepemilikan JKN/BPJS: *${rekap.totalBpjs} Jiwa*\n\n`;

  message += `📝 *Catatan Nakes Desa:*\n`;
  message += `Data terhimpun secara real-time melalui Aplikasi Nakes Desa Kringa untuk tindak lanjut kunjungan rumah (PIS-PK), Posyandu Balita & Lansia, serta koordinasi ke Kelurahan/Desa dan Puskesmas.\n\n`;
  message += `Hormat kami,\n`;
  message += `*${NURSE_PROFILE.nama}*\n`;
  message += `Nakes Perawat Desa Kringa\n`;
  message += `📞 ${NURSE_PROFILE.telepon}`;

  return message;
}

/**
 * Buat link langsung buka WhatsApp dengan pesan terisi
 */
export function getWhatsAppUrl(messageText: string, phone: string = CLEAN_WA_NUMBER): string {
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${phone}?text=${encoded}`;
}
