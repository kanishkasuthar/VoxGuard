import React from "react";

export const LoadingState = ({ message = "Loading security telemetry..." }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center space-y-3">
      <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
};
