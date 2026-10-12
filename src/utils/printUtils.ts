import { KartuKeluarga } from '../types';
import { calculateAgeInMonths, calculateAgeInYears, formatUmurDisplay, getKategoriUsia } from './calculations';
import { formatDateIndo, formatPekerjaanShort, formatPendidikanShort } from './exportUtils';
import { NURSE_PROFILE } from './whatsapp';

/**
 * Mencetak formulir rekam kesehatan Kartu Keluarga (Family Folder)
 * Menggunakan hidden iframe untuk isolasi cetak sempurna tanpa merusak tampilan layar.
 */
export function printKartuKeluarga(kk: KartuKeluarga): void {
  // Remove existing print iframe if any
  const existingFrame = document.getElementById('print-iframe-holder');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe-holder';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const memberRows = kk.anggota
    .map((a, idx) => {
      const years = calculateAgeInYears(a.tanggalLahir);
      const months = calculateAgeInMonths(a.tanggalLahir);
      const umurStr = `${years} th (${months} bln)`;
      const kategori = getKategoriUsia(a.tanggalLahir);

      const statusKesehatanList: string[] = [];
      if (a.ibuHamil?.isHamil) {
        statusKesehatanList.push(`Ibu Hamil (${a.ibuHamil.statusRisiko || 'Normal'}, ${a.ibuHamil.usiaKehamilanMinggu || 0} mgg)`);
      }
      if (a.balita?.statusGizi) {
        statusKesehatanList.push(`Gizi Balita: ${a.balita.statusGizi}`);
      }
      if (a.penyakitSpm?.hipertensi) {
        statusKesehatanList.push(`Hipertensi (${a.penyakitSpm.tekananDarah || 'Positif'})`);
      }
      if (a.penyakitSpm?.diabetesMelitus) {
        statusKesehatanList.push(`DM (${a.penyakitSpm.gulaDarahSewaktu ? a.penyakitSpm.gulaDarahSewaktu + ' mg/dL' : 'Positif'})`);
      }
      if (a.penyakitSpm?.tbParu) statusKesehatanList.push('TB Paru');
      if (a.penyakitSpm?.odgjBerat) statusKesehatanList.push('ODGJ Berat');
      if (a.penyakitSpm?.merokok) statusKesehatanList.push('Perokok');
      if (statusKesehatanList.length === 0) statusKesehatanList.push('Sehat / Normal');

      return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>
          <strong>${a.nama}</strong><br/>
          <span style="font-family: monospace; font-size: 10px; color: #444;">NIK: ${a.nik}</span>
        </td>
        <td style="text-align: center;">${a.hubungan}</td>
        <td style="text-align: center;">${a.jenisKelamin === 'Perempuan' ? 'P' : 'L'}</td>
        <td>
          ${formatDateIndo(a.tanggalLahir)}<br/>
          <span style="font-size: 10px; color: #555;">${umurStr} - ${kategori}</span>
        </td>
        <td style="text-align: center;">${a.agama}</td>
        <td>${formatPendidikanShort(a.pendidikan)}</td>
        <td>${formatPekerjaanShort(a.pekerjaan)}</td>
        <td style="font-family: monospace; font-size: 10px;">${a.noBpjs || '-'}</td>
        <td style="font-size: 10px;">
          ${statusKesehatanList.join('<br/>')}
          ${a.penyakitSpm?.catatanKesehatan ? `<br/><em>"${a.penyakitSpm.catatanKesehatan}"</em>` : ''}
        </td>
      </tr>`;
    })
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Cetak Kartu Kesehatan Keluarga - No KK ${kk.noKK}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #111;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .kop-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      border-bottom: 2.5px solid #000;
      padding-bottom: 8px;
      margin-bottom: 12px;
      text-align: center;
    }
    .kop-logo {
      width: 55px;
      height: 55px;
      object-fit: contain;
    }
    .kop-text h3 {
      margin: 0;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .kop-text h2 {
      margin: 2px 0;
      font-size: 15px;
      font-weight: 800;
      color: #064e3b;
      text-transform: uppercase;
    }
    .kop-text p {
      margin: 0;
      font-size: 10px;
      color: #444;
    }
    .judul-dokumen {
      text-align: center;
      font-weight: bold;
      font-size: 13px;
      text-decoration: underline;
      margin: 10px 0 14px 0;
      letter-spacing: 0.5px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .meta-table td {
      padding: 3px 6px;
      vertical-align: top;
    }
    .meta-table td.label {
      width: 22%;
      font-weight: 600;
      color: #333;
    }
    .meta-table td.val {
      width: 28%;
      font-weight: 500;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 10.5px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #333;
      padding: 4px 6px;
      vertical-align: top;
    }
    table.data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
      font-size: 10.5px;
    }
    .section-title {
      font-weight: bold;
      font-size: 11.5px;
      margin: 12px 0 4px 0;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 2px;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 45%;
      text-align: center;
      font-size: 11px;
    }
    .signature-space {
      height: 50px;
    }
    .foto-rumah {
      max-width: 140px;
      max-height: 90px;
      border: 1px solid #999;
      border-radius: 4px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <!-- Kop Surat Resmi -->
  <div class="kop-container">
    <img src="https://iili.io/nV7JfqB.png" alt="Logo" class="kop-logo" />
    <div class="kop-text">
      <h3>Pemerintah Kabupaten Sikka · Kecamatan Talibura</h3>
      <h2>Kantor Desa Kringa · Poskesdes Kringa</h2>
      <p>Wilayah Kerja Binaan: Dusun KRINGA · Dusun BOGANATAR · Dusun OGOLIDI</p>
    </div>
  </div>

  <div class="judul-dokumen">FORMULIR REKAM KESEHATAN KELUARGA (PIS-PK / NAKES DESA)</div>

  <!-- Profil Kartu Keluarga -->
  <table class="meta-table">
    <tr>
      <td class="label">Nomor Kartu Keluarga</td>
      <td class="val">: <strong style="font-family: monospace; font-size: 12px;">${kk.noKK}</strong></td>
      <td class="label">Dusun Binaan</td>
      <td class="val">: <strong>${kk.dusun}</strong></td>
    </tr>
    <tr>
      <td class="label">Nama Kepala Keluarga</td>
      <td class="val">: <strong>${kk.kepalaKeluargaNama}</strong></td>
      <td class="label">Rukun Tetangga (RT/RW)</td>
      <td class="val">: RT ${kk.rt} / RW ${kk.rw}</td>
    </tr>
    <tr>
      <td class="label">Alamat Domisili</td>
      <td class="val" colspan="3">: ${kk.alamat}</td>
    </tr>
    <tr>
      <td class="label">Sanitasi & Lingkungan</td>
      <td class="val" colspan="3">: Jamban Sehat: <strong>${kk.jambanSehat ? 'Ada / Memenuhi Syarat' : 'Belum Memenuhi Syarat'}</strong> · Sarana Air Bersih: <strong>${kk.saranaAirBersih ? 'Ada / Layak' : 'Belum Layak'}</strong></td>
    </tr>
    ${
      kk.fotoRumahUrl
        ? `
    <tr>
      <td class="label">Dokumentasi Rumah</td>
      <td class="val" colspan="3"><img src="${kk.fotoRumahUrl}" alt="Dokumentasi Rumah" class="foto-rumah" /></td>
    </tr>`
        : ''
    }
  </table>

  <!-- Data Anggota Keluarga -->
  <div class="section-title">Daftar Anggota Keluarga & Status Kesehatan 12 SPM (${kk.anggota.length} Jiwa)</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25px;">No</th>
        <th>Nama Lengkap & NIK</th>
        <th style="width: 75px;">Hubungan</th>
        <th style="width: 25px;">JK</th>
        <th style="width: 100px;">Tgl Lahir & Usia</th>
        <th style="width: 50px;">Agama</th>
        <th style="width: 65px;">Pendidikan</th>
        <th style="width: 65px;">Pekerjaan</th>
        <th style="width: 75px;">No BPJS</th>
        <th style="width: 130px;">Status Kesehatan & SPM</th>
      </tr>
    </thead>
    <tbody>
      ${memberRows}
    </tbody>
  </table>

  <!-- Tanda Tangan Resmi -->
  <div class="signature-grid">
    <div class="signature-box">
      <p style="margin: 0;">Mengetahui,<br/>Kepala Keluarga</p>
      <div class="signature-space"></div>
      <p style="margin: 0; font-weight: bold; text-decoration: underline;">( ${kk.kepalaKeluargaNama} )</p>
    </div>
    <div class="signature-box">
      <p style="margin: 0;">Desa Kringa, ${currentDate}<br/>Perawat Pembina Desa Kringa</p>
      <div class="signature-space"></div>
      <p style="margin: 0; font-weight: bold; text-decoration: underline;">${NURSE_PROFILE.nama}</p>
      <p style="margin: 0; font-size: 9.5px; font-family: monospace;">STR: ${NURSE_PROFILE.str}</p>
    </div>
  </div>
</body>
</html>
`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for images and styling to load, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Iframe print error', e);
      window.print();
    }
  }, 350);
}
