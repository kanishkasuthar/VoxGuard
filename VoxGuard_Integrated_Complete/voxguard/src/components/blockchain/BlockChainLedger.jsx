import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FiDatabase, FiLock, FiCheckCircle } from "react-icons/fi";

export const BlockChainLedger = ({ blocks, onVerifyBlock }) => {
  return (
    <div className="space-y-6">
      {/* Privacy Notice Card */}
      <Card className="p-6 bg-slate-900 text-white space-y-2 border-slate-800">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
          <FiLock /> Zero-Knowledge Privacy Architecture
        </div>
        <h2 className="text-lg font-bold tracking-tight">Tamper-Evident Immutable Blockchain Records</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
          <strong>PRIVACY GUARANTEE:</strong> Raw voice/audio data is not stored on the blockchain. Only SHA-256 evidence hashes, threat metadata, and policy action records are anchored to guarantee privacy and tamper-proof auditability.
        </p>
      </Card>

      {/* Ledger Block List */}
      <div className="space-y-4">
        {blocks.map((block) => (
          <Card key={block.blockNumber} className="p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-xs">
                  #{block.blockNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">{block.incidentId}</span>
                    <span className="text-xs text-slate-400">• {block.timestamp}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{block.threatType}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={block.riskScore > 80 ? "HIGH RISK" : "SAFE"} size="sm" />
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center gap-1">
                  <FiCheckCircle className="text-emerald-600" /> {block.status}
                </span>
              </div>
            </div>

            {/* Hashes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">Evidence Hash (SHA-256)</span>
                <span className="text-slate-800 break-all">{block.evidenceHash}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">Blockchain Transaction ID</span>
                <span className="text-blue-600 font-semibold break-all">{block.txHash}</span>
              </div>
            </div>

            {/* Block Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
              <span>Signatures: <strong className="text-slate-800">{block.nodeSignatures} Nodes</strong></span>
              <Button
                variant="primary"
                size="sm"
                icon={FiCheckCircle}
                onClick={() => onVerifyBlock(block.txHash)}
              >
                Verify Proof
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
