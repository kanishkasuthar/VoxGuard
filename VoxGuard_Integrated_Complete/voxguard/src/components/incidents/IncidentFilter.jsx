import React from "react";
import { FiSearch, FiFilter } from "react-icons/fi";

export const IncidentFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <FiSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search by ID, caller, target, or vector..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <FiFilter /> Filters:
        </div>

        {/* Risk Filter */}
        <select
          value={filters.riskStatus}
          onChange={(e) => onFilterChange({ ...filters, riskStatus: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 bg-white"
        >
          <option value="ALL">All Risk Statuses</option>
          <option value="CRITICAL">Critical Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>

        {/* Threat Type Filter */}
        <select
          value={filters.threatType}
          onChange={(e) => onFilterChange({ ...filters, threatType: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 bg-white"
        >
          <option value="ALL">All Threat Types</option>
          <option value="Real-time Voice Cloning">Voice Cloning</option>
          <option value="Replay & Voice Synthesis">Replay & Synthesis</option>
          <option value="Deepfake Voice Spoofing">Deepfake Spoofing</option>
        </select>
      </div>
    </div>
  );
};
