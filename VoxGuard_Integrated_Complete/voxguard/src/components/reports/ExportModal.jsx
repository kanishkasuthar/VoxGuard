import React, { useState } from "react";
import { FiX, FiDownload, FiFileText, FiCheckCircle } from "react-icons/fi";

export const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("last30");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setIsExporting(true);
    await onExport(format, dateRange);
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-slide-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Export Security Audit Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleExportSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Select Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  format === "pdf"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Executive PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  format === "csv"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Raw Telemetry CSV Data
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Time Period Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="yearToDate">Year to Date (YTD)</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 text-slate-600 leading-relaxed text-[11px]">
            Includes detection confidence breakdowns, block hashes, attack vectors, and compliance certificate seals.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <FiDownload /> {isExporting ? "Compiling Report..." : "Generate & Download"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
