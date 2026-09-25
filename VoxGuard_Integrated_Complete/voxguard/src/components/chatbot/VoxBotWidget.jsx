import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { voxbotService } from "../../services/voxbotService";
import { FiMessageSquare, FiX, FiSend, FiShield, FiRefreshCw, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const VoxBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm VoxBot, your built-in voice-security assistant. Ask me anything about VoxGuard, voice security, or an active call.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Dynamic context calculation based on current route
  const getRouteContext = () => {
    const path = location.pathname;
    if (path.includes("monitor") || path.includes("live")) {
      return {
        route: path,
        label: "CURRENT CALL",
        status: "Risk: 91 • Voice Clone Detected",
        isCallActive: true
      };
    }
    if (path.includes("incidents")) {
      return {
        route: path,
        label: "INCIDENT VG-1042",
        status: "Voice Clone Attack • Blocked",
        incidentId: "VG-1042"
      };
    }
    if (path.includes("voice-identities")) {
      return {
        route: path,
        label: "VOICE IDENTITY VG-001",
        status: "Kanishka • 96% Match on New Number",
        voiceId: "VG-001"
      };
    }
    return {
      route: path,
      label: "VOXGUARD SYSTEM",
      status: "Protection Active • All Nodes Ready"
    };
  };

  const contextData = getRouteContext();

  // Quick suggestions based on context
  const getSuggestedPrompts = () => {
    if (contextData.route.includes("monitor")) {
      return [
        "Why was this call blocked?",
        "Why is the risk score high?",
        "Why did anti-spoofing fail?",
        "What is voice cloning?"
      ];
    }
    if (contextData.route.includes("incidents")) {
      return [
        "What happened in this incident?",
        "What evidence was recorded?",
        "Is my voice stored on blockchain?",
        "What is anti-spoofing?"
      ];
    }
    if (contextData.route.includes("voice-identities")) {
      return [
        "Why did this new number match VG-001?",
        "Why is Voice ID different from a phone number?",
        "What does 96% similarity mean?",
        "How does detection work?"
      ];
    }
    return [
      "What is voice cloning?",
      "How does detection work?",
      "What does risk score mean?",
      "Is my voice stored on blockchain?",
      "How can I protect myself?"
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsThinking(true);

    try {
      const botRes = await voxbotService.queryBot(query, contextData);
      setMessages((prev) => [...prev, { ...botRes, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I encountered an error analyzing your question. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Small Floating VoxBot Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg border border-slate-700 flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer group"
        title="Open VoxBot Voice Security Assistant"
      >
        <div className="relative">
          <FiShield className="text-xl" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
        </div>
      </button>

      {/* Floating Compact Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Panel Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  <FiShield />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs font-mono tracking-wider text-white">VOXBOT</h3>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">Voice Security Assistant</span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Close VoxBot"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Context Strip */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase">{contextData.label}</span>
              <span className="text-blue-700 font-semibold truncate max-w-[180px]">{contextData.status}</span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[360px] bg-slate-50/40 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs font-medium"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs font-normal whitespace-pre-wrap leading-relaxed"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 text-slate-400 font-mono text-xs py-1">
                  <FiRefreshCw className="animate-spin text-blue-600 text-xs" />
                  <span>VoxBot is analyzing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {getSuggestedPrompts().map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-mono font-medium transition-colors cursor-pointer text-left"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask VoxBot..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-600 text-slate-900"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors cursor-pointer"
                title="Send Message"
              >
                <FiSend className="text-xs" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
