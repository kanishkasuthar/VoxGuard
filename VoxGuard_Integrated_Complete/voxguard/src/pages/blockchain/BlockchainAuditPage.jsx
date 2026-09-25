import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/NotificationContext";
import { offlineStorage } from "../../services/offlineStorage";
import { blockchainService } from "../../services/blockchainService";
import { evidenceHashService } from "../../services/evidenceHashService";
import { useNetworkStatus } from "../../services/networkStatus";
import {
  FiCheckCircle,
  FiShield,
  FiX,
  FiInfo,
  FiCopy,
  FiCheck,
  FiSearch,
  FiUploadCloud,
  FiAlertTriangle,
  FiRefreshCw,
  FiLock,
  FiFileText
} from "react-icons/fi";

export const BlockchainAuditPage = () => {
  const isOnline = useNetworkStatus();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [auditRecords, setAuditRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState(null);
  
  // Verification Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [testFile, setTestFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Initial Demo Baseline Records
  const demoRecords = [
    {
      id: "VG-AUDIT-1042",
      evidenceId: "VG-AUDIT-1042",
      fileName: "synthetic_cfo_call.wav",
      classification: "AI-GENERATED",
      verdict: "DEEPFAKE_CLONE_DETECTED",
      riskLevel: "CRITICAL",
      overallRisk: 91,
      evidenceHash: "3f9a7e8b2c4d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f",
      shortHash: "3f9a...7e6f",
      blockchainStatus: "CONFIRMED",
      transactionHash: "0x81ab92cd34ef56a789bc01de23fa45bc67de89fa01bc23de45fa67bc89de01fa",
      blockNumber: 12894562,
      network: "Polygon Amoy Testnet",
      isDemoRecord: true,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "VG-AUDIT-1041",
      evidenceId: "VG-AUDIT-1041",
      fileName: "authentic_ceo_interview.wav",
      classification: "HUMAN",
      verdict: "AUTHENTIC_HUMAN",
      riskLevel: "LOW",
      overallRisk: 12,
      evidenceHash: "81ac91ef7b2c4d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e",
      shortHash: "81ac...8d7e",
      blockchainStatus: "CONFIRMED",
      transactionHash: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      blockNumber: 12894108,
      network: "Polygon Amoy Testnet",
      isDemoRecord: true,
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Load audit records from IndexedDB + Demo Records
  const loadRecords = async () => {
    try {
      const stored = await offlineStorage.getAllRecords();
      const formattedStored = stored.map((r) => ({
        id: r.id || r.evidenceId,
        evidenceId: r.evidenceId || r.id,
        fileName: r.fileName || "audio_sample.wav",
        classification: r.classification || (r.verdict === "AUTHENTIC_HUMAN" ? "HUMAN" : "AI-GENERATED"),
        verdict: r.verdict || "AUTHENTIC_HUMAN",
        riskLevel: r.riskLevel || "LOW",
        overallRisk: r.overallRisk || r.deepfakeProbability || 10,
        evidenceHash: r.evidenceHash || "a81f92bc34de56fa789bc01de23fa45bc67de89fa01bc23de45fa67bc89de01f",
        shortHash: evidenceHashService.shortenHash(r.evidenceHash || "a81f92bc34de56fa789bc01de23fa45bc67de89fa01bc23de45fa67bc89de01f"),
        blockchainStatus: r.blockchainStatus || "PENDING_SYNC",
        transactionHash: r.transactionHash || null,
        blockNumber: r.blockNumber || null,
        network: r.network || (isOnline ? "Polygon Amoy Testnet" : "Offline Local Ledger"),
        timestamp: r.timestamp || new Date().toISOString()
      }));

      // Combine user IndexedDB records with baseline demo records
      const combined = [...formattedStored, ...demoRecords];
      setAuditRecords(combined);
    } catch (e) {
      setAuditRecords(demoRecords);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleCopyHash = (text, label, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    addToast(`Copied ${label} to clipboard.`, "success");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleOpenVerifyModal = (record) => {
    setSelectedRecord(record);
    setTestFile(null);
    setVerificationResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTestFile(e.target.files[0]);
    }
  };

  const handleRunVerification = async () => {
    if (!testFile || !selectedRecord) {
      addToast("Please select an audio file to verify.", "warning");
      return;
    }

    setIsVerifying(true);
    addToast("Computing Web Crypto SHA-256 digest & checking against ledger...", "info");

    try {
      // Real Web Crypto SHA-256 calculation & comparison
      const calculatedHash = await evidenceHashService.computeAudioHash(testFile);
      const targetHash = selectedRecord.evidenceHash;
      const hashMatch = evidenceHashService.verifyHashesEqual(targetHash, calculatedHash);

      console.log("[CRYPTO VERIFICATION DEBUG]");
      console.log("Selected file:", testFile.name);
      console.log("Selected file size:", testFile.size, "bytes");
      console.log("Selected file MIME:", testFile.type || "unknown");
      console.log("Selected file byte length:", testFile.size);
      console.log("Stored hash:", targetHash);
      console.log("Calculated hash:", calculatedHash);
      console.log("Hash algorithm: SHA-256");
      console.log("Hash payload: RAW ORIGINAL FILE BYTES");
      console.log("Hashes equal:", hashMatch);

      setIsVerifying(false);
      setVerificationResult({
        isVerified: hashMatch,
        hashMatch,
        calculatedHash,
        storedHash: targetHash,
        evidenceId: selectedRecord.evidenceId,
        isDemoRecord: Boolean(selectedRecord.isDemoRecord),
        status: hashMatch ? "EVIDENCE VERIFIED" : "INTEGRITY CHECK FAILED",
        message: hashMatch
          ? "Cryptographic SHA-256 match confirmed. Audio evidence is authentic and unmodified."
          : selectedRecord.isDemoRecord
          ? "INTEGRITY MISMATCH: Selected file does not match this sample demo record hash. Upload a fresh audio sample on the Analyze Voice page to generate a verifiable evidence hash for your local file."
          : "TAMPER DETECTED: Calculated SHA-256 hash does not match stored blockchain evidence hash!"
      });

      if (hashMatch) {
        addToast("✓ EVIDENCE VERIFIED: Cryptographic SHA-256 hash matched.", "success");
      } else {
        addToast("⚠ TAMPER DETECTED: SHA-256 evidence mismatch!", "threat");
      }
    } catch (err) {
      setIsVerifying(false);
      addToast(`Verification error: ${err.message}`, "error");
    }
  };

  const filteredRecords = auditEventsFilter(auditRecords, searchQuery);

  function auditEventsFilter(records, query) {
    if (!query.trim()) return records;
    const q = query.toLowerCase();
    return records.filter(
      (r) =>
        r.evidenceId.toLowerCase().includes(q) ||
        r.classification.toLowerCase().includes(q) ||
        r.evidenceHash.toLowerCase().includes(q) ||
        (r.transactionHash && r.transactionHash.toLowerCase().includes(q))
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* PAGE TITLE */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-[#0B3047] tracking-tight">
          PROTECTION HISTORY
        </h1>
        <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
          Tamper-evident security records for VoxGuard decisions & cryptographic evidence verification.
        </p>
      </div>

      {/* TOP AUDIT INTEGRITY HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-[#D8E3E8] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-[10px] font-mono uppercase font-bold text-[#66737C] tracking-widest">
            EVIDENCE INTEGRITY ARCHITECTURE
          </div>
          <h2 className="text-base font-serif font-bold text-[#0B3047]">
            SHA-256 Cryptographic Evidence Ledger
          </h2>
          <p className="text-xs text-[#66737C]">
            VoxGuard computes a deterministic SHA-256 hash for every voice analysis. Raw audio is never stored on-chain.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span
            className={`px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
              isOnline
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {isOnline ? <FiCheckCircle className="text-emerald-600" /> : <FiAlertTriangle className="text-amber-600" />}
            {isOnline ? "RPC NETWORK ONLINE" : "OFFLINE PENDING QUEUE"}
          </span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-3 text-[#66737C] text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search evidence ID, classification, or SHA-256 hash..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8E3E8] text-xs font-mono bg-white text-[#0B3047] focus:outline-none focus:border-[#0B3047]"
        />
      </div>

      {/* EVIDENCE AUDIT RECORDS TABLE / CARDS */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-[#D8E3E8] rounded-2xl p-5 shadow-xs hover:border-[#0B3047] transition-all space-y-4 font-sans"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8E3E8] pb-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#0B3047] bg-[#FAF7F2] border border-[#D8E3E8] px-2.5 py-1 rounded-lg">
                  {record.evidenceId}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    record.classification === "HUMAN"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : record.classification === "AI-GENERATED"
                      ? "bg-rose-100 text-rose-900 border border-rose-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {record.classification}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    record.blockchainStatus === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                  }`}
                >
                  {record.blockchainStatus === "CONFIRMED" ? "✓ CONFIRMED" : "⌛ PENDING SYNC"}
                </span>
                <span className="text-[#66737C] text-[11px]">
                  {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* SHA-256 Hash & Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-[#FAF7F2] p-4 rounded-xl border border-[#D8E3E8]">
              {/* Evidence Hash */}
              <div>
                <span className="text-[10px] text-[#66737C] uppercase font-bold block">
                  SHA-256 Evidence Hash
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-[#0B3047] truncate" title={record.evidenceHash}>
                    {evidenceHashService.shortenHash(record.evidenceHash)}
                  </span>
                  <button
                    onClick={(e) => handleCopyHash(record.evidenceHash, "SHA-256 Hash", e)}
                    className="p-1 text-[#66737C] hover:text-[#0B3047] transition-colors"
                    title="Copy Full 64-char Hash"
                  >
                    {copiedHash === record.evidenceHash ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Transaction Hash */}
              <div>
                <span className="text-[10px] text-[#66737C] uppercase font-bold block">
                  Blockchain Transaction
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {record.transactionHash ? (
                    <>
                      <span className="font-bold text-[#0B3047] truncate" title={record.transactionHash}>
                        {evidenceHashService.shortenHash(record.transactionHash)}
                      </span>
                      <button
                        onClick={(e) => handleCopyHash(record.transactionHash, "Transaction Hash", e)}
                        className="p-1 text-[#66737C] hover:text-[#0B3047] transition-colors"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === record.transactionHash ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                      </button>
                    </>
                  ) : (
                    <span className="text-amber-800 text-[11px] font-sans italic">
                      Pending RPC Broadcast (Offline / Unconfirmed)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#66737C] font-mono">
                Risk Level: <strong className="text-[#0B3047]">{record.riskLevel}</strong> ({record.overallRisk}/100)
              </span>

              <button
                onClick={() => handleOpenVerifyModal(record)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B3047] text-white font-mono text-xs font-bold hover:bg-[#123F59] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FiLock className="text-xs text-emerald-400" /> VERIFY EVIDENCE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE VERIFY EVIDENCE MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
          <div className="bg-white border border-[#D8E3E8] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-3">
              <div className="flex items-center gap-2">
                <FiShield className="text-xl text-[#0B3047]" />
                <h3 className="font-serif font-bold text-[#0B3047] text-base">
                  Cryptographic Evidence Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#66737C] hover:text-[#0B3047]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono bg-[#FAF7F2] p-3 rounded-xl border border-[#D8E3E8]">
              <div className="flex justify-between">
                <span className="text-[#66737C]">TARGET EVIDENCE ID:</span>
                <span className="font-bold text-[#0B3047]">{selectedRecord.evidenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66737C]">STORED SHA-256 HASH:</span>
                <span className="font-bold text-[#0B3047]">{evidenceHashService.shortenHash(selectedRecord.evidenceHash)}</span>
              </div>
            </div>

            {/* Test Audio File Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B3047] block">
                Select Audio File to Validate against Evidence Hash:
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D8E3E8] rounded-xl p-4 text-center cursor-pointer hover:border-[#0B3047] transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FiUploadCloud className="text-2xl text-[#0B3047] mx-auto mb-1" />
                <p className="text-xs font-mono font-bold text-[#0B3047]">
                  {testFile ? testFile.name : "Click to select local audio file"}
                </p>
                <p className="text-[10px] text-[#66737C] mt-0.5">
                  Computes Web Crypto SHA-256 & compares against on-chain record.
                </p>
              </div>
            </div>

            {/* Verification Button */}
            <button
              onClick={handleRunVerification}
              disabled={isVerifying || !testFile}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                !testFile
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isVerifying
                  ? "bg-[#123F59] text-white animate-pulse"
                  : "bg-[#0B3047] text-white hover:bg-[#123F59]"
              }`}
            >
              <FiRefreshCw className={isVerifying ? "animate-spin" : ""} />
              {isVerifying ? "Computing SHA-256 & Verifying..." : "RUN CRYPTOGRAPHIC INTEGRITY VERIFICATION"}
            </button>

            {/* Verification Result Banner */}
            {verificationResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                  verificationResult.isVerified
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verificationResult.isVerified ? (
                    <FiCheckCircle className="text-emerald-600 text-lg" />
                  ) : (
                    <FiAlertTriangle className="text-rose-600 text-lg" />
                  )}
                  <span>{verificationResult.status}</span>
                </div>
                <p className="text-[11px] font-sans leading-relaxed">
                  {verificationResult.message}
                </p>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] space-y-1">
                  <p>Calculated SHA-256: <code className="font-bold">{evidenceHashService.shortenHash(verificationResult.calculatedHash)}</code></p>
                  <p>Recorded SHA-256: <code className="font-bold">{evidenceHashService.shortenHash(verificationResult.storedHash)}</code></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
