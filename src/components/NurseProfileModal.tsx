import React, { useRef, useState } from 'react';
import {
  Award,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Upload,
  X,
} from 'lucide-react';
import { CLEAN_WA_NUMBER, NURSE_PROFILE, TARGET_WA_NUMBER } from '../utils/whatsapp';

interface NurseProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportTab: () => void;
  avatarUrl?: string;
  onUpdateAvatar?: (newAvatar: string) => void;
}

export const NurseProfileModal: React.FC<NurseProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenReportTab,
  avatarUrl = NURSE_PROFILE.avatar,
  onUpdateAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result && onUpdateAvatar) {
        onUpdateAvatar(result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    if (onUpdateAvatar) {
      onUpdateAvatar(NURSE_PROFILE.avatar);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header with teal gradient */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt={NURSE_PROFILE.nama}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md cursor-pointer group-hover:brightness-90 transition-all"
                referrerPolicy="no-referrer"
                onClick={() => fileInputRef.current?.click()}
                title="Klik untuk upload / ganti foto profil"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Klik untuk upload / ganti foto profil"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-semibold">Ganti Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Nakes Terdaftar & Pembina Desa</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">{NURSE_PROFILE.nama}</h2>
              <p className="text-xs text-slate-200 mt-0.5">{NURSE_PROFILE.jabatan}</p>

              {/* Upload image action buttons */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto Profil</span>
                </button>
                {avatarUrl !== NURSE_PROFILE.avatar && (
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                {uploadSuccess && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Foto Tersimpan!</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 mt-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{NURSE_PROFILE.desa}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Surat Tanda Registrasi (STR)</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {NURSE_PROFILE.str}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Puskesmas Pembina</span>
              <span className="font-semibold text-slate-800">
                Puskesmas Boganatar / Talibura
              </span>
            </div>
          </div>

          {/* Wilayah Binaan 3 Dusun */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Wilayah Kerja 3 Dusun Binaan</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <div className="text-xs font-bold text-emerald-950">Dusun KRINGA</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">RT 01, 02, 03 / RW 01</div>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-center">
                <div className="text-xs font-bold text-teal-950">Dusun BOGANATAR</div>
                <div className="text-[11px] text-teal-700 mt-0.5">RT 01, 02, 03 / RW 02</div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-center">
                <div className="text-xs font-bold text-cyan-950">Dusun OGOLIDI</div>
                <div className="text-[11px] text-cyan-700 mt-0.5">RT 01, 02 / RW 03</div>
              </div>
            </div>
          </div>

          {/* Layanan & Tugas Pokok */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pendataan kesehatan terpadu Kartu Keluarga & 12 Standar Pelayanan Minimal (SPM).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pemantauan ibu hamil risti, bayi (0-12 bln), dan pencegahan stunting balita (1-5 thn).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Skrining Penyakit Tidak Menular (Hipertensi/DM) & pelacakan TB Paru / ODGJ.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pelaporan berkala otomatis ke Kepala Desa/Kelurahan & Puskesmas via WhatsApp.</span>
            </div>
          </div>

          {/* Official Phone & WhatsApp Link */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-800 font-medium">Nomor WhatsApp Resmi Nakes:</div>
              <div className="font-mono tabular-nums text-sm font-bold text-emerald-950">
                {TARGET_WA_NUMBER}
              </div>
            </div>
            <a
              href={`https://wa.me/${CLEAN_WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buka Chat WA</span>
            </a>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenReportTab();
              }}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              Buka Laporan Kelurahan
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
