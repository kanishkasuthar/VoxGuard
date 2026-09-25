import React, { useState } from "react";
import { ExportModal } from "../../components/reports/ExportModal";
import { reportsService } from "../../services/reportsService";
import { useToast } from "../../context/NotificationContext";
import { FiFileText, FiDownload, FiCheckCircle, FiShield, FiBarChart2, FiLock } from "react-icons/fi";

export const ReportsPage = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleExportSubmit = async (format, dateRange) => {
    addToast(`Generating ${format.toUpperCase()} report for ${dateRange}...`, "info");
    const res = await reportsService.exportReport(format, dateRange);
    addToast(`Export Ready! Downloaded ${res.fileName} (${res.size})`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Security Intelligence & Compliance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export SOC executive summaries, compliance certificate verifications, and voice threat telemetry.
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <FiDownload /> Export Audit Report
        </button>
      </div>

      {/* Grid of Available Preset Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              <FiBarChart2 />
            </div>
            <h3 className="font-bold text-slate-900 text-base">24-Hour Voice Threat Overview</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete breakdown of incoming telecommunication traffic, synthetic deepfake detection rates, and latency logs.
            </p>
          </div>
          <button
            onClick={() => handleExportSubmit("pdf", "last24h")}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-xs text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <FiDownload /> Download PDF
          </button>
        </div>

        {/* Report 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <FiCheckCircle />
            </div>
            <h3 className="font-bold text-slate-900 text-base">SOC2 & ISO Compliance Audit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verifies zero-knowledge audio handling, HIPAA hash vaulting, and immutable blockchain ledger anchor proofs.
            </p>
          </div>
          <button
            onClick={() => handleExportSubmit("pdf", "soc2")}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-xs text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <FiDownload /> Download Audit Seal
          </button>
        </div>

        {/* Report 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              <FiShield />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Forensic Evidence Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Raw spectral spectrogram matrices, formant micro-jitters, and SHA-256 evidence hashes formatted for legal submission.
            </p>
          </div>
          <button
            onClick={() => handleExportSubmit("csv", "forensics")}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <FiDownload /> Download CSV Package
          </button>
        </div>
      </div>

      {/* Compliance Overview Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <FiLock /> Enterprise Privacy Compliance & Zero-Retention Standard
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] font-sans">SOC2 TYPE II</span>
            <span className="text-emerald-400 font-bold">COMPLIANT</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] font-sans">ISO 27001</span>
            <span className="text-emerald-400 font-bold">CERTIFIED</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] font-sans">GDPR PRIVACY</span>
            <span className="text-blue-400 font-bold">ZERO AUDIO STORED</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] font-sans">HIPAA VAULT</span>
            <span className="text-emerald-400 font-bold">ENCRYPTED HASHING</span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
};
