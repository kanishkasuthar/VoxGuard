import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useToast } from "../../context/NotificationContext";
import { FiShield, FiUser, FiMail, FiLock, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Dynamic Password Validation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!hasMinLen || !hasUpper || !hasNum || !hasSpecial) {
      setErrorMsg("Please satisfy all password complexity requirements.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({ name, email, phone, password });
      setIsLoading(false);
      addToast("Account created successfully! We sent a verification code to your email.", "success");
      navigate("/verify-email");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-sans">
      <div className="bg-white rounded-3xl border border-[#D8E3E8] shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Visual Artwork Panel */}
        <div className="md:col-span-5 bg-[#EEF7FA] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D8E3E8] text-[#0B3047]">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B3047] text-white flex items-center justify-center text-lg">
              <FiShield />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#123F59] tracking-widest block">
                JOIN VOXGUARD
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#0B3047]">
                Set up your voice security layer.
              </h2>
            </div>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Make every voice conversation authentic and secure with real-time deepfake defense.
            </p>
          </div>

          <div className="py-6 space-y-2">
            <div className="text-[10px] font-mono text-[#66737C] uppercase">Voice Security Infrastructure</div>
            <div className="h-16 flex items-center justify-center gap-1 bg-white/60 p-3 rounded-2xl border border-[#DCECF4]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.sin(i * 0.5) * 40 + 45}%` }}
                  className="w-1 rounded-full bg-[#123F59]"
                />
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#66737C]">
            Protected by VoxGuard.AI • SIH26104
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 md:p-10 space-y-5 flex flex-col justify-center font-sans">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-[#0B3047]">Create your VoxGuard account.</h1>
            <p className="text-xs text-[#66737C]">Set up your personal voice security layer.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#E45B5B]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-[#0B3047] block mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kanishka Suthar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0B3047] block mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0B3047] block mb-0.5">Phone Number (Optional)</label>
              <span className="text-[10px] text-[#66737C] block mb-1">Used to associate protected calls with your account.</span>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0B3047] block mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#66737C] hover:text-[#0B3047]"
                >
                  {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>

              {/* Password Requirements Dynamic Indicators */}
              {password && (
                <div className="mt-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <span className={`flex items-center gap-1 ${hasMinLen ? "text-[#3FA66B]" : "text-[#66737C]"}`}>
                    {hasMinLen ? <FiCheck /> : <FiX />} At least 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUpper ? "text-[#3FA66B]" : "text-[#66737C]"}`}>
                    {hasUpper ? <FiCheck /> : <FiX />} One uppercase letter
                  </span>
                  <span className={`flex items-center gap-1 ${hasNum ? "text-[#3FA66B]" : "text-[#66737C]"}`}>
                    {hasNum ? <FiCheck /> : <FiX />} One number
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? "text-[#3FA66B]" : "text-[#66737C]"}`}>
                    {hasSpecial ? <FiCheck /> : <FiX />} One special character
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-[#0B3047] block mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-[#66737C] text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
                />
              </div>

              {confirmPassword && (
                <span className={`text-[10px] font-mono block mt-1 ${passwordsMatch ? "text-[#3FA66B]" : "text-[#E45B5B]"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#66737C]">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-[#D8E3E8] text-[#0B3047] focus:ring-0"
                />
                <span>
                  I agree to the <Link to="/about" className="font-bold text-[#0B3047] hover:underline">Terms of Service</Link> and <Link to="/about" className="font-bold text-[#0B3047] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase font-mono tracking-wider disabled:opacity-50 mt-2"
            >
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"} <FiArrowRight />
            </button>
          </form>

          <div className="text-center text-xs text-[#66737C] pt-3 border-t border-[#D8E3E8]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#0B3047] hover:underline font-mono uppercase tracking-wider text-[11px]">
              SIGN IN
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
