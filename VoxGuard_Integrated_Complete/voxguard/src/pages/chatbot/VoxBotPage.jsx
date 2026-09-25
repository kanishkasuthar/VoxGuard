import React, { useState } from "react";
import { voxbotService } from "../../services/voxbotService";
import { useToast } from "../../context/NotificationContext";
import { FiShield, FiSend, FiRefreshCw, FiInfo, FiCheckCircle } from "react-icons/fi";

export const VoxBotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm VoxBot, your built-in voice-security assistant. Ask me anything about VoxGuard, voice security, or a detected call.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const { addToast } = useToast();

  const suggestedPrompts = [
    "What is voice cloning?",
    "How does detection work?",
    "What does my risk score mean?",
    "Why was my call blocked?",
    "Is my voice stored on blockchain?",
    "How does Voice ID work?"
  ];

  const handleSend = async (queryText) => {
    const text = queryText || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText("");
    setIsThinking(true);

    try {
      const res = await voxbotService.queryBot(text, { route: "/voxbot" });
      setMessages((prev) => [...prev, { ...res, id: Date.now() + 1 }]);
    } catch (err) {
      addToast("Failed to connect to VoxBot assistant.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-center gap-2">
              <FiShield className="text-blue-600" /> VOXBOT
            </h1>
            <span className="text-xs font-mono font-bold text-slate-500">• Voice Security Assistant</span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Clear your doubts about voice security, deepfake detection, risk scores, and privacy.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ● Ready
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col min-h-[520px]">
        
        {/* Active Context Banner */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-mono text-xs border-b border-slate-800">
          <span className="flex items-center gap-2 text-blue-400 font-bold">
            <FiInfo /> SYSTEM CONTEXT
          </span>
          <span className="text-slate-300">VoxGuard SOC Telemetry Active</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[420px] bg-slate-50/40 text-xs font-sans">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-xs font-medium"
                    : "bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs shadow-2xs leading-relaxed whitespace-pre-wrap font-mono"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs py-1">
              <FiRefreshCw className="animate-spin text-blue-600 text-xs" />
              <span>VoxBot is analyzing...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions (4-6 prompts) */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
          {suggestedPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask VoxBot..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-600 text-slate-900 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer"
          >
            SEND <FiSend className="text-xs" />
          </button>
        </div>
      </div>

    </div>
  );
};
