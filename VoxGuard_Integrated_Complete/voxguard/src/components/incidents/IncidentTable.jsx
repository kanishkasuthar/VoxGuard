import React from "react";
import { ThreatBadge } from "../common/Badge";
import { FiEye, FiFileText, FiDatabase } from "react-icons/fi";

export const IncidentTable = ({ incidents, onViewDetails, onGenerateReport }) => {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        No security incidents matched your filter parameters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <th className="px-4 py-3">Incident ID & Time</th>
              <th className="px-4 py-3">Caller Identity</th>
              <th className="px-4 py-3">Target Desk</th>
              <th className="px-4 py-3">Threat Vector</th>
              <th className="px-4 py-3">Risk Assessment</th>
              <th className="px-4 py-3">Enforcement Action</th>
              <th className="px-4 py-3 text-right">SOC Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-indigo-600 block">{inc.id}</span>
                  <span className="text-[10px] text-slate-400">{inc.timestamp}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">{inc.caller}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{inc.callerPhone}</div>
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700">
                  {inc.targetDepartment}
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {inc.threatType}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <ThreatBadge level={inc.riskStatus} size="sm" />
                    <span className="font-mono font-bold text-slate-700">{inc.riskScore}/100</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-block px-2.5 py-1 rounded font-bold text-[10px] uppercase ${
                      inc.actionTaken.includes("Blocked")
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : inc.actionTaken.includes("Allowed")
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {inc.actionTaken}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => onViewDetails(inc)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="View Evidence Details"
                  >
                    <FiEye className="text-sm" />
                  </button>
                  <button
                    onClick={() => onGenerateReport(inc.id)}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                    title="Generate PDF Report"
                  >
                    <FiFileText className="text-sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
