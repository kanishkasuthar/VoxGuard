import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useVoxBot } from "../../context/VoxBotContext";
import { useToast } from "../../context/NotificationContext";
import {
  FiShield,
  FiMinus,
  FiPlus,
  FiSend,
  FiX,
  FiRefreshCw,
  FiActivity,
  FiCopy,
  FiRotateCcw,
  FiTrash2,
  FiCheck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const VoxBotSidePanel = () => {
  const {
    messages,
    isCollapsed,
    isThinking,
    sendMessage,
    regenerateLastResponse,
    clearChat,
    toggleCollapse
  } = useVoxBot();

  const [inputText, setInputText] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const location = useLocation();
  const chatEndRef = useRef(null);
  const { addToast } = useToast();

  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes("monitor")) {
      return {
        route: path,
        currentPage: "Live Monitor",
        isCallActive: true,
        telemetry: {
          riskScore: 91,
          cloneProbability: "94%",
          speakerMatch: "61%",
          antiSpoofing: "FAIL",
          decision: "BLOCKED"
        }
      };
    }
    if (path.includes("voice-identities")) {
      return {
        route: path,
        currentPage: "Voice Identities",
        voiceId: "VG-001",
        personName: "Kanishka",
        similarity: "96%"
      };
    }
    if (path.includes("incidents")) {
      return {
        route: path,
        currentPage: "Incidents",
        incidentId: "VG-1042",
        threatType: "Voice Clone Attack",
        actionTaken: "BLOCKED"
      };
    }
    if (path.includes("blockchain")) {
      return {
        route: path,
        currentPage: "Blockchain Audit",
        blockHeight: "#1,049,281",
        auditStatus: "VERIFIED IMMUTABLE"
      };
    }
    return {
      route: path,
      currentPage: "Dashboard",
      callsMonitored: 24,
      threatsDetected: 3,
      callsBlocked: 2
    };
  };

  const activeContext = getPageContext();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isCollapsed, mobileOpen]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendMessage(text, activeContext);
    if (!textToSend) setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Response copied to clipboard.", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Inner Conversational Chat UI
  const renderChatContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B2638] font-sans text-xs">
      
      {/* VoxBot Header */}
      <div className="p-3.5 bg-white dark:bg-[#0B2638] border-b border-[#D8E3E8] dark:border-[#234255] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0B3047] dark:bg-[#102F42] text-white flex items-center justify-center text-xs border border-transparent dark:border-[#234255]">
            <FiShield />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-xs text-[#0B3047] dark:text-[#F5F7F8]">VOXBOT AI</h3>
              <span className="text-[10px] font-mono font-bold text-[#3FA66B] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3FA66B] animate-pulse" /> Online
              </span>
            </div>
            <span className="text-[10px] text-[#66737C] dark:text-[#AAB8C2] font-mono block">Conversational Security Assistant</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-lg transition-colors cursor-pointer"
            title="Clear Conversation"
          >
            <FiTrash2 className="text-xs" />
          </button>
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expand VoxBot" : "Collapse VoxBot"}
          >
            <FiMinus className="text-xs" />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-lg transition-colors cursor-pointer"
            title="Close VoxBot"
          >
            <FiX className="text-xs" />
          </button>
        </div>
      </div>

      {/* Page Context Badge */}
      <div className="px-3.5 py-1.5 bg-[#FAF7F2] dark:bg-[#071A27] border-b border-[#D8E3E8] dark:border-[#234255] text-[10px] font-mono flex items-center justify-between">
        <span className="text-[#66737C] dark:text-[#AAB8C2] uppercase font-bold">PAGE CONTEXT:</span>
        <span className="text-[#0B3047] dark:text-[#F5F7F8] font-bold">{activeContext.currentPage}</span>
      </div>

      {/* Conversation Log */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-4 bg-[#FAF7F2]/40 dark:bg-[#071A27]/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-start gap-1.5 max-w-[92%] group">
              {m.sender === "bot" && (
                <div className="w-5 h-5 rounded-full bg-[#EEF7FA] dark:bg-[#102F42] border border-[#DCECF4] dark:border-[#234255] text-[#0B3047] dark:text-[#F5F7F8] flex items-center justify-center text-[10px] shrink-0 mt-1">
                  <FiActivity />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl relative ${
                  m.sender === "user"
                    ? "bg-[#0B3047] dark:bg-[#123F59] text-white rounded-tr-xs font-medium"
                    : "bg-white dark:bg-[#0B2638] text-[#0B3047] dark:text-[#F5F7F8] border border-[#D8E3E8] dark:border-[#234255] rounded-tl-xs shadow-2xs leading-relaxed whitespace-pre-wrap font-sans"
                }`}
              >
                {m.text}
              </div>
            </div>

            {/* Message Action Tools for Bot Messages */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[9px] font-mono text-[#66737C] dark:text-[#AAB8C2]">
              <span>{m.timestamp}</span>
              {m.sender === "bot" && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => handleCopyText(m.id, m.text)}
                    className="hover:text-[#0B3047] dark:hover:text-[#F5F7F8] transition-colors cursor-pointer flex items-center gap-0.5"
                    title="Copy Text"
                  >
                    {copiedId === m.id ? <FiCheck className="text-[#3FA66B]" /> : <FiCopy />} Copy
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic 3-Dot Typing State */}
        {isThinking && (
          <div className="flex items-center gap-2 text-[#66737C] dark:text-[#AAB8C2] font-mono text-xs py-1">
            <FiRefreshCw className="animate-spin text-[#0B3047] dark:text-[#F5F7F8] text-xs" />
            <span>VoxBot is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Controls: Regenerate & Input */}
      <div className="p-3 bg-white dark:bg-[#0B2638] border-t border-[#D8E3E8] dark:border-[#234255] space-y-2 shrink-0">
        
        {/* Regenerate Last Response Action Button */}
        {messages.length > 2 && !isThinking && (
          <div className="flex justify-center">
            <button
              onClick={() => regenerateLastResponse(activeContext)}
              className="px-2.5 py-1 rounded-full bg-[#EEF7FA] dark:bg-[#102F42] hover:bg-[#DCECF4] dark:hover:bg-[#1E384A] text-[#0B3047] dark:text-[#F5F7F8] text-[10px] font-mono font-bold border border-[#DCECF4] dark:border-[#234255] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FiRotateCcw className="text-[10px]" /> Regenerate Response
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VoxBot anything..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#071A27] border border-[#D8E3E8] dark:border-[#234255] text-xs focus:outline-none focus:border-[#0B3047] dark:focus:border-[#6FA8C5] text-[#0B3047] dark:text-[#F5F7F8] placeholder-[#66737C] dark:placeholder-[#AAB8C2] resize-none max-h-24"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#0B3047] dark:bg-[#102F42] text-white hover:bg-[#123F59] disabled:opacity-40 transition-colors cursor-pointer shrink-0 border border-transparent dark:border-[#234255]"
            title="Send"
          >
            <FiSend className="text-xs" />
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* DESKTOP PERSISTENT RIGHT PANEL (300px - 340px) */}
      <aside className="hidden lg:flex shrink-0">
        {isCollapsed ? (
          <button
            onClick={toggleCollapse}
            className="h-full px-2 py-4 bg-white dark:bg-[#0B2638] border-l border-[#D8E3E8] dark:border-[#234255] text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] flex flex-col items-center gap-3 cursor-pointer shadow-2xs font-mono text-xs transition-colors"
            title="Expand VoxBot Conversational Assistant"
          >
            <FiShield className="text-base text-[#0B3047] dark:text-[#F5F7F8]" />
            <span className="writing-mode-vertical tracking-widest uppercase font-bold text-[11px] text-[#66737C] dark:text-[#AAB8C2]">
              ≋ VoxBot AI
            </span>
            <FiPlus className="text-xs text-[#66737C] dark:text-[#AAB8C2]" />
          </button>
        ) : (
          <div className="w-80 h-[calc(100vh-4rem)] sticky top-16 border-l border-[#D8E3E8] dark:border-[#234255] bg-white dark:bg-[#0B2638] shadow-2xs flex flex-col">
            {renderChatContent()}
          </div>
        )}
      </aside>

      {/* MOBILE FLOATING TRIGGER BUTTON & BOTTOM SHEET */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-4 right-4 z-40 px-4 py-2.5 rounded-full bg-[#0B3047] text-white shadow-lg border border-[#123F59] flex items-center gap-2 font-mono text-xs font-bold cursor-pointer"
        >
          <FiShield className="text-sm" />
          <span>≋ VoxBot AI</span>
          <span className="w-2 h-2 rounded-full bg-[#3FA66B]" />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#0B3047]/40 backdrop-blur-xs">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full h-[85vh] bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
              >
                {renderChatContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
