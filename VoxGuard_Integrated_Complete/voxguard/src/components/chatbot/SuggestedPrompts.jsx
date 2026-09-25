import React from "react";
import { FiMessageSquare } from "react-icons/fi";

export const SuggestedPrompts = ({ prompts, onSelectPrompt }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
        <FiMessageSquare className="text-indigo-600" /> Suggested Security Inquiries
      </h4>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors font-medium"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
};
