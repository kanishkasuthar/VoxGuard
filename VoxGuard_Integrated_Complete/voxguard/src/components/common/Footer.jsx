import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiLock, FiCheckCircle } from "react-icons/fi";

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0B2638] text-[#66737C] dark:text-[#AAB8C2] text-xs border-t border-[#D8E3E8] dark:border-[#234255] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-[#0B3047] dark:text-[#F5F7F8]">
              <div className="w-8 h-8 rounded-lg bg-[#0B3047] dark:bg-[#102F42] text-white flex items-center justify-center text-sm font-bold border border-transparent dark:border-[#234255]">
                <FiShield />
              </div>
              <span className="font-serif font-bold text-lg text-[#0B3047] dark:text-[#F5F7F8]">VoxGuard.AI</span>
            </div>
            <p className="text-xs text-[#66737C] dark:text-[#AAB8C2] leading-relaxed">
              Real-time AI voice cloning impersonation detection & prevention system. SIH Problem Statement SIH26104.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#3FA66B] dark:text-[#54B982] font-mono font-bold">
              <FiCheckCircle /> SIH 2026 Prototype
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-[#0B3047] dark:text-[#F5F7F8] font-bold font-serif mb-3 text-sm">Navigation</h4>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link to="/live-monitor" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">Live Call Monitor</Link></li>
              <li><Link to="/analyze-voice" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">Analyze Voice</Link></li>
              <li><Link to="/voice-identities" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">Voice Identities</Link></li>
              <li><Link to="/incidents" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">Security Incidents</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-[#0B3047] dark:text-[#F5F7F8] font-bold font-serif mb-3 text-sm">Security & Privacy</h4>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link to="/blockchain" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">Blockchain Audit</Link></li>
              <li><Link to="/voxbot" className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors">VoxBot Assistant</Link></li>
              <li><span className="text-[#66737C] dark:text-[#AAB8C2]">ECAPA-TDNN Biometrics</span></li>
              <li><span className="text-[#66737C] dark:text-[#AAB8C2]">Anti-Spoofing Filters</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-[#0B3047] dark:text-[#F5F7F8] font-bold font-serif mb-3 text-sm">Privacy Guarantee</h4>
            <div className="p-3.5 rounded-2xl bg-[#EEF7FA] dark:bg-[#102F42] border border-[#DCECF4] dark:border-[#234255] text-xs text-[#0B3047] dark:text-[#F5F7F8] space-y-1.5 font-sans">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-[#123F59] dark:text-[#6FA8C5]">
                <FiLock /> Zero Raw-Audio Policy
              </div>
              <p className="text-[11px] text-[#66737C] dark:text-[#AAB8C2] leading-normal">
                Raw voice audio is discarded immediately after spectral inference. Only SHA-256 evidence hashes are recorded.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-[#D8E3E8] dark:border-[#234255] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-[#66737C] dark:text-[#AAB8C2]">
          <p>© {new Date().getFullYear()} VoxGuard.AI Voice Impersonation Shield. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] cursor-pointer">Privacy</span>
            <span className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] cursor-pointer">Terms</span>
            <span className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
