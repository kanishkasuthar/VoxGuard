import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useToast } from "../../context/NotificationContext";
import { FiShield, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

export const LoginPage = () => {
  const [email, setEmail] = useState("admin@voxguard.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setIsLoading(false);
      addToast(`Welcome back to VoxGuard! Session established.`, "success");
      navigate("/dashboard");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Email or password is incorrect.");
      addToast("Authentication failed. Please check credentials.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans">
      <div className="bg-white rounded-3xl border border-[#D8E3E8] shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Brand / Message Panel */}
        <div className="md:col-span-5 bg-[#EEF7FA] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D8E3E8] text-[#0B3047]">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B3047] text-white flex items-center justify-center text-lg shadow-2xs">
              <FiShield />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#123F59] tracking-widest block">
                VOICE TRUST CONTINUUM
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#0B3047] leading-tight">
                Every voice leaves a trust trail.
              </h2>
            </div>
            <p className="text-xs text-[#66737C] leading-relaxed">
              VoxGuard helps detect voice-cloning impersonation before it becomes a threat.
            </p>
          </div>

          {/* Thin Waveform Line Visual Concept */}
          <div className="py-8 space-y-3">
            <div className="text-[10px] font-mono text-[#66737C] uppercase tracking-wider">
              VOICE → IDENTITY → TRUST
            </div>
            <div className="h-16 flex items-center justify-center gap-1 bg-white/60 p-3 rounded-2xl border border-[#DCECF4]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.sin(i * 0.4) * 45 + 50}%` }}
                  className="w-1 rounded-full bg-[#0B3047]"
                />
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#66737C] flex items-center justify-between border-t border-[#DCECF4] pt-3">
            <span>Protected by VoxGuard.AI</span>
            <span>SIH26104</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 md:p-10 space-y-6 flex flex-col justify-center font-sans">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-[#0B3047]">
              Welcome back to VoxGuard.
            </h1>
            <p className="text-xs text-[#66737C]">
              Your voice security starts here.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#E45B5B]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#0B3047] block mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type="email"
                  required
                  placeholder="admin@voxguard.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-[#0B3047]">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-[#123F59] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#66737C] hover:text-[#0B3047]"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#66737C]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D8E3E8] text-[#0B3047] focus:ring-0"
                />
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "SIGNING IN..." : "LOGIN"} <FiArrowRight />
            </button>
          </form>

          <div className="text-center text-xs text-[#66737C] pt-4 border-t border-[#D8E3E8]">
            New to VoxGuard?{" "}
            <Link to="/register" className="font-bold text-[#0B3047] hover:underline uppercase tracking-wider text-[11px] font-mono">
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
