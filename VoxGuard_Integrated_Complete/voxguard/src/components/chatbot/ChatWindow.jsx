import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiTrash2, FiShield, FiUser, FiCpu } from "react-icons/fi";

export const ChatWindow = ({ messages, onSendMessage, onClearChat, isThinking }) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <FiCpu className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              VoxBot Security Assistant <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </h3>
            <p className="text-[11px] text-slate-500">Autonomous SOC Threat Copilot & Voice Biometric Intelligence</p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
          title="Clear Conversation"
        >
          <FiTrash2 /> Clear
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? "justify-start" : "justify-end"}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                  <FiShield />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? "bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs"
                    : "bg-indigo-600 text-white shadow-xs rounded-tr-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5 opacity-80 text-[10px] font-medium">
                  <span>{isBot ? "VoxBot AI" : "You (SOC Analyst)"}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.sources && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Sources:</span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                  <FiUser />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
              <FiCpu className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> Analyzing acoustic telemetry & knowledge base...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask VoxBot about voice cloning vectors, active incidents, biometrics..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <FiSend /> Send
        </button>
      </form>
    </div>
  );
};
