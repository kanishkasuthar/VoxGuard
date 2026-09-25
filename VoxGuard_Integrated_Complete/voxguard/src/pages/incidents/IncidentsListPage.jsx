import React, { useState, useEffect } from "react";
import { AttackReplay } from "../../components/visualizations/AttackReplay";
import { incidentService } from "../../services/incidentService";
import { useToast } from "../../context/NotificationContext";
import { FiAlertOctagon, FiDatabase, FiCheckCircle, FiFileText } from "react-icons/fi";

export const IncidentsListPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await incidentService.getIncidents({ riskStatus: "ALL", threatType: "ALL" });
      setIncidents(data);
      if (data.length > 0) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      addToast("Failed to fetch incident records.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (id) => {
    addToast(`Compiling forensic report for Incident ${id}...`, "info");
    const res = await incidentService.generateIncidentReport(id);
    addToast(`Downloaded ${res.filename} successfully!`, "success");
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase font-bold text-[#E45B5B] tracking-widest block">
          INTERCEPTED SECURITY EVENT LOGS
        </span>
        <h1 className="text-3xl font-serif text-[#0B3047]">Incidents</h1>
        <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
          Repository of intercepted voice impersonation attacks and enforcement records.
        </p>
      </div>

      {/* CLEAN TWO-PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: INCIDENT LIST (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-[#D8E3E8] pb-3">
            <span className="font-bold text-[#0B3047] uppercase tracking-wider">INCIDENT REPOSITORY</span>
            <span className="text-[#66737C]">{incidents.length} Events</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-[#66737C]">Loading incident logs...</div>
          ) : (
            <div className="space-y-2.5">
              {incidents.map((inc) => {
                const isSelected = selectedIncident && selectedIncident.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EEF7FA] border-[#0B3047] shadow-2xs"
                        : "bg-[#FAF7F2] border-[#D8E3E8] hover:border-[#123F59]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#0B3047] text-sm block">{inc.id}</span>
                        <span className="text-xs font-sans font-semibold text-[#123F59] block mt-0.5">{inc.threatType}</span>
                        <span className="text-[10px] text-[#66737C] block mt-1">{inc.timestamp}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inc.actionTaken.includes("Blocked") ? "bg-rose-50 text-[#E45B5B]" : "bg-amber-50 text-[#E8A23A]"
                      }`}>
                        {inc.actionTaken.includes("Blocked") ? "Blocked" : "Monitored"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SELECTED INCIDENT DETAILS (7 cols) */}
        {selectedIncident ? (
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 font-mono text-xs">
            
            {/* Incident Header */}
            <div className="flex justify-between items-start border-b border-[#D8E3E8] pb-4">
              <div>
                <span className="text-[10px] text-[#66737C] uppercase font-bold tracking-wider block">SELECTED INCIDENT</span>
                <h2 className="text-2xl font-serif text-[#0B3047]">{selectedIncident.id}</h2>
                <span className="text-xs font-bold text-[#E45B5B] uppercase block mt-0.5">{selectedIncident.threatType}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-[#E45B5B] font-bold text-xs">
                ACTION: {selectedIncident.actionTaken}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
                <span className="text-[10px] text-[#66737C] block font-sans">Risk Score</span>
                <span className="text-xl font-extrabold text-[#E45B5B]">{selectedIncident.riskScore}</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
                <span className="text-[10px] text-[#66737C] block font-sans">Clone Probability</span>
                <span className="text-xl font-extrabold text-[#0B3047]">94%</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
                <span className="text-[10px] text-[#66737C] block font-sans">Speaker Match</span>
                <span className="text-xl font-extrabold text-[#0B3047]">61%</span>
              </div>
            </div>

            {/* ATTACK REPLAY COMPONENT */}
            <AttackReplay incidentId={selectedIncident.id} />

            {/* Blockchain Evidence Reference */}
            <div className="p-4 bg-[#0B3047] text-white rounded-2xl space-y-2 border border-[#123F59]">
              <div className="flex items-center justify-between border-b border-[#123F59] pb-2">
                <span className="font-bold text-[#DCECF4] flex items-center gap-1.5">
                  <FiDatabase /> EVIDENCE HASH ANCHOR
                </span>
                <span className="text-[#3FA66B] font-sans text-[10px] font-bold flex items-center gap-1">
                  <FiCheckCircle /> VERIFIED IMMUTABLE
                </span>
              </div>
              <div className="text-[11px] text-[#DCECF4] space-y-1">
                <div><strong className="text-slate-300">Hash:</strong> {selectedIncident.evidenceHash}</div>
                <div><strong className="text-slate-300">Tx:</strong> {selectedIncident.blockchainTx}</div>
              </div>
            </div>

            {/* Report Export Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleGenerateReport(selectedIncident.id)}
                className="px-5 py-2.5 bg-[#0B3047] text-white font-bold text-xs rounded-xl hover:bg-[#123F59] transition-all flex items-center gap-2 cursor-pointer"
              >
                <FiFileText /> Generate Forensic PDF Report
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 bg-white p-12 rounded-3xl border border-[#D8E3E8] text-center text-[#66737C]">
            Select an incident to view details.
          </div>
        )}

      </div>

    </div>
  );
};
