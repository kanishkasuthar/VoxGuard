import React from "react";
import { Link } from "react-router-dom";
import { ThreatBadge } from "../common/Badge";
import { FiArrowRight, FiAlertOctagon } from "react-icons/fi";


export const RecentIncidentsWidget = ({ incidents }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <FiAlertOctagon className="text-rose-500" /> Recent Security Incidents
          </h3>
          <p className="text-xs text-slate-500">Latest flagged acoustic impersonations & enforcement logs</p>
        </div>

        <Link
          to="/incidents"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View All <FiArrowRight />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
              <th className="pb-2">Incident ID</th>
              <th className="pb-2">Caller / Target</th>
              <th className="pb-2">Threat Vector</th>
              <th className="pb-2">Risk</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.slice(0, 4).map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 font-mono font-bold text-indigo-600">{inc.id}</td>
                <td className="py-3">
                  <div className="font-medium text-slate-800">{inc.caller}</div>
                  <div className="text-[10px] text-slate-400">{inc.targetDepartment}</div>
                </td>
                <td className="py-3 text-slate-600 font-medium">{inc.threatType}</td>
                <td className="py-3">
                  <ThreatBadge level={inc.riskStatus} size="sm" />
                </td>
                <td className="py-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                    {inc.actionTaken}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
