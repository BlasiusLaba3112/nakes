/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { INITIAL_KELUARGA_LIST } from './data/seedData';
import { KartuKeluarga } from './types';
import { calculateRekapitulasi } from './utils/calculations';
import { NURSE_PROFILE, TARGET_WA_NUMBER } from './utils/whatsapp';

import { DashboardView } from './components/DashboardView';
import { DetailKeluargaModal } from './components/DetailKeluargaModal';
import { ExportImportModal } from './components/ExportImportModal';
import { KartuKeluargaFormModal } from './components/KartuKeluargaFormModal';
import { Navbar } from './components/Navbar';
import { NurseProfileModal } from './components/NurseProfileModal';
import { PelaporanView } from './components/PelaporanView';
import { PendudukTable } from './components/PendudukTable';
import { SpmKesehatanView } from './components/SpmKesehatanView';

const STORAGE_KEY = 'nakes_desa_kringa_db_v1';

export default function App() {
  const [keluargaList, setKeluargaList] = useState<KartuKeluarga[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    return INITIAL_KELUARGA_LIST;
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'master-data' | 'spm-kesehatan' | 'pelaporan'
  >('dashboard');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKeluarga, setEditingKeluarga] = useState<KartuKeluarga | null>(null);
  const [selectedDetailKeluarga, setSelectedDetailKeluarga] = useState<KartuKeluarga | null>(null);
  const [isNurseProfileOpen, setIsNurseProfileOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  const [nurseAvatar, setNurseAvatar] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nakes_profile_avatar');
      if (saved && saved.trim() !== '') return saved;
    } catch (e) {
      console.error(e);
    }
    return NURSE_PROFILE.avatar;
  });

  const handleUpdateAvatar = (newAvatar: string) => {
    setNurseAvatar(newAvatar);
    try {
      localStorage.setItem('nakes_profile_avatar', newAvatar);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keluargaList));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [keluargaList]);

  // Overall calculations
  const rekap = useMemo(() => calculateRekapitulasi(keluargaList), [keluargaList]);

  const handleSaveKeluarga = (kkData: KartuKeluarga) => {
    setKeluargaList((prev) => {
      const index = prev.findIndex((k) => k.id === kkData.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = kkData;
        return copy;
      }
      return [kkData, ...prev];
    });
    setEditingKeluarga(null);
  };

  const handleDeleteKeluarga = (kkId: string) => {
    setKeluargaList((prev) => prev.filter((k) => k.id !== kkId));
    if (selectedDetailKeluarga?.id === kkId) {
      setSelectedDetailKeluarga(null);
    }
  };

  const handleImportBackup = (newList: KartuKeluarga[]) => {
    setKeluargaList(newList);
  };

  const handleImportData = (
    importedKkList: KartuKeluarga[],
    mode: 'merge' | 'replace',
    dusunTarget?: string
  ) => {
    setKeluargaList((prev) => {
      if (mode === 'replace') {
        const remaining =
          dusunTarget && dusunTarget !== 'Semua'
            ? prev.filter((k) => k.dusun !== dusunTarget)
            : [];
        return [...importedKkList, ...remaining];
      } else {
        const map = new Map<string, KartuKeluarga>();
        prev.forEach((k) => map.set(k.noKK, k));
        importedKkList.forEach((k) => map.set(k.noKK, k));
        return Array.from(map.values());
      }
    });
  };

  const handleResetSampleData = () => {
    setKeluargaList(INITIAL_KELUARGA_LIST);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingKeluarga(null);
          setIsAddModalOpen(true);
        }}
        onOpenNurseProfile={() => setIsNurseProfileOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        totalKK={rekap.totalKK}
        totalJiwa={rekap.totalPenduduk}
        nurseAvatar={nurseAvatar}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            keluargaList={keluargaList}
            onOpenAddModal={() => {
              setEditingKeluarga(null);
              setIsAddModalOpen(true);
            }}
            onOpenReportTab={() => setActiveTab('pelaporan')}
            onSelectKeluarga={(kk) => setSelectedDetailKeluarga(kk)}
            onOpenExportImport={() => setIsExportImportOpen(true)}
          />
        )}

        {activeTab === 'master-data' && (
          <PendudukTable
            keluargaList={keluargaList}
            onOpenAddModal={() => {
              setEditingKeluarga(null);
              setIsAddModalOpen(true);
            }}
            onEditKeluarga={(kk) => {
              setEditingKeluarga(kk);
              setIsAddModalOpen(true);
            }}
            onDeleteKeluarga={handleDeleteKeluarga}
            onSelectKeluarga={(kk) => setSelectedDetailKeluarga(kk)}
            onOpenExportImport={() => setIsExportImportOpen(true)}
          />
        )}

        {activeTab === 'spm-kesehatan' && (
          <SpmKesehatanView
            keluargaList={keluargaList}
            onSelectKeluarga={(kk) => setSelectedDetailKeluarga(kk)}
            onOpenReportTab={() => setActiveTab('pelaporan')}
          />
        )}

        {activeTab === 'pelaporan' && (
          <PelaporanView
            keluargaList={keluargaList}
            onImportBackup={handleImportBackup}
            onResetSampleData={handleResetSampleData}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong className="text-slate-800">NAKES DESA KRINGA</strong> · Wilayah Binaan: Dusun KRINGA, Dusun BOGANATAR, Dusun OGOLIDI.
          </div>
          <div className="flex items-center gap-3">
            <span>Perawat: <strong>{NURSE_PROFILE.nama}</strong></span>
            <span>·</span>
            <span>WA: <strong className="font-mono text-emerald-700">{TARGET_WA_NUMBER}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <KartuKeluargaFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingKeluarga(null);
        }}
        onSave={handleSaveKeluarga}
        initialData={editingKeluarga}
      />

      <DetailKeluargaModal
        kk={selectedDetailKeluarga}
        isOpen={!!selectedDetailKeluarga}
        onClose={() => setSelectedDetailKeluarga(null)}
        onEdit={(kk) => {
          setSelectedDetailKeluarga(null);
          setEditingKeluarga(kk);
          setIsAddModalOpen(true);
        }}
      />

      <NurseProfileModal
        isOpen={isNurseProfileOpen}
        onClose={() => setIsNurseProfileOpen(false)}
        onOpenReportTab={() => {
          setIsNurseProfileOpen(false);
          setActiveTab('pelaporan');
        }}
        avatarUrl={nurseAvatar}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        keluargaList={keluargaList}
        onImportData={handleImportData}
      />
    </div>
  );
}
