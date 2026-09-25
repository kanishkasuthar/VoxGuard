import React from "react";
import { FiInbox } from "react-icons/fi";

export const EmptyState = ({ title = "No data found", description = "There are no records matching your request.", icon: Icon = FiInbox, action }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-6 space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
        <Icon />
      </div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export const LoadingState = ({ message = "Loading security telemetry..." }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center space-y-3">
      <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
};
