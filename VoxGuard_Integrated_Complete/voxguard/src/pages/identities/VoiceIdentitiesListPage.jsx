import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { voiceIdentityService } from "../../services/voiceIdentityService";
import { useToast } from "../../context/NotificationContext";
import { FiUsers, FiSearch, FiArrowRight, FiShield, FiPhone, FiCheckCircle } from "react-icons/fi";

export const VoiceIdentitiesListPage = () => {
  const [identities, setIdentities] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await voiceIdentityService.getIdentities({ search });
      setIdentities(data);
    } catch (err) {
      addToast("Failed to fetch voice identity vault.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase font-bold text-[#123F59] tracking-widest block">
          BIOMETRIC VOICEPRINT VAULT
        </span>
        <h1 className="text-3xl font-serif text-[#0B3047]">Voice Identities</h1>
        <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
          Enrolled acoustic voice profiles compared across incoming calls and spoofed phone numbers.
        </p>
      </div>

      {/* SAME VOICE / NEW NUMBER SCENARIO DEMO PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4">
        <div className="flex items-center justify-between text-xs font-mono border-b border-[#D8E3E8] pb-3">
          <span className="font-bold text-[#0B3047] uppercase tracking-wider">NEW CALL ARRIVAL SCENARIO</span>
          <span className="text-[#123F59] font-bold">CROSS-NUMBER MATCH</span>
        </div>

        <div className="p-4 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[#66737C] block text-[10px]">NEW PHONE NUMBER DETECTED</span>
              <span className="text-base font-extrabold text-[#0B3047]">+91 XXXXX 32109</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#66737C] block">MATCH STATUS</span>
              <span className="text-xs font-bold text-[#3FA66B] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                Possible Match
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#D8E3E8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="font-bold text-[#0B3047] text-sm">POSSIBLE EXISTING VOICE IDENTITY</div>
              <div className="text-[#66737C] text-[11px] font-sans">
                Acoustic similarity: <strong className="text-[#0B3047]">96% Match</strong> with registered Voice ID <strong className="text-[#123F59]">VG-001 (Kanishka)</strong>.
              </div>
            </div>
            <Link 
              to="/voice-identities/VG-001" 
              className="px-4 py-2 bg-[#0B3047] text-white rounded-xl text-xs font-bold hover:bg-[#123F59] transition-all shrink-0 flex items-center gap-1"
            >
              Review Identity <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Identity Vault List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#D8E3E8] font-mono text-xs">
          <span className="font-bold text-[#66737C] uppercase tracking-widest">
            REGISTERED VOICE IDENTITIES ({identities.length})
          </span>
          <span className="text-[#123F59]">Confidence-based Matching</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#66737C] bg-white rounded-3xl border border-[#D8E3E8]">
            Searching voice identity vault...
          </div>
        ) : (
          <div className="space-y-4">
            {identities.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4 font-mono text-xs">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D8E3E8] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg font-bold text-[#0B3047]">{item.personName}</span>
                      <span className="text-xs font-bold text-[#123F59] bg-[#EEF7FA] px-2 py-0.5 rounded border border-[#DCECF4]">{item.id}</span>
                    </div>
                    <span className="text-[11px] text-[#66737C] block mt-0.5 font-sans">Likely Same Voice • {item.confidence}% Match Rating</span>
                  </div>

                  <Link 
                    to={`/voice-identities/${item.id}`} 
                    className="px-4 py-2 bg-[#FAF7F2] text-[#0B3047] hover:bg-[#EEF7FA] font-bold rounded-xl border border-[#D8E3E8] transition-all flex items-center gap-1"
                  >
                    View Identity Timeline <FiArrowRight />
                  </Link>
                </div>

                {/* Identity Insights Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] space-y-0.5">
                    <span className="text-[10px] text-[#66737C] block font-sans">Total Calls</span>
                    <span className="text-base font-extrabold text-[#0B3047]">{item.callsObserved}</span>
                  </div>
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] space-y-0.5">
                    <span className="text-[10px] text-[#66737C] block font-sans">Threats Detected</span>
                    <span className={`text-base font-extrabold ${item.threatCount > 0 ? "text-[#E45B5B]" : "text-[#3FA66B]"}`}>
                      {item.threatCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] space-y-0.5">
                    <span className="text-[10px] text-[#66737C] block font-sans">Status</span>
                    <span className="text-xs font-bold text-[#123F59]">Monitored</span>
                  </div>
                </div>

                {/* Known Phone Numbers */}
                <div className="p-3 bg-[#EEF7FA]/50 rounded-xl border border-[#DCECF4] space-y-1">
                  <span className="text-[10px] font-sans text-[#66737C] uppercase font-bold block">Known Phone Numbers:</span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[#0B3047]">
                    {item.knownNumbers.map((num, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#D8E3E8] font-mono">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
