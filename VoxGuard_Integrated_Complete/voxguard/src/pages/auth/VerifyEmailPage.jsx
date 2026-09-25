import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/NotificationContext";
import { FiShield, FiMail, FiCheckCircle, FiRefreshCw, FiArrowRight } from "react-icons/fi";
import { authService } from "../../services/authService";

export const VerifyEmailPage = () => {
  const [otp, setOtp] = useState(["4", "8", "2", "1", "9", "6"]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const userEmail = authService.getCurrentUser()?.email || "admin@voxguard.ai";

  useEffect(() => {
    let timer;
    if (resendCountdown > 0 && !canResend) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendCountdown, canResend]);

  const handleOtpChange = (val, idx) => {
    const copy = [...otp];
    copy[idx] = val.slice(-1);
    setOtp(copy);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      addToast("Email verified successfully! Access granted to VoxGuard Dashboard.", "success");
      navigate("/dashboard");
    }, 800);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setResendCountdown(30);
    addToast(`New verification code resent to ${userEmail}.`, "info");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans">
      <div className="bg-white rounded-3xl border border-[#D8E3E8] p-8 text-center space-y-6 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF7FA] text-[#0B3047] border border-[#DCECF4] flex items-center justify-center mx-auto text-xl shadow-2xs">
          <FiMail />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-bold text-[#0B3047]">Verify your email.</h1>
          <p className="text-xs text-[#66737C]">
            We sent a verification code to your email address:
          </p>
          <span className="text-xs font-mono font-bold text-[#123F59] block pt-1">{userEmail}</span>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2 font-mono">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                className="w-10 h-12 text-center text-base font-bold rounded-xl border border-[#D8E3E8] bg-[#FAF7F2] focus:outline-none focus:border-[#0B3047] text-[#0B3047]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer font-mono tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? "CHECKING..." : "CHECK VERIFICATION STATUS"} <FiArrowRight />
          </button>
        </form>

        <div className="text-xs text-[#66737C] pt-2 border-t border-[#D8E3E8] space-y-2 font-sans">
          <div>
            Didn't receive the email?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[#0B3047] hover:underline cursor-pointer"
              >
                Resend code
              </button>
            ) : (
              <span className="font-mono text-[11px] text-[#66737C]">
                Resend available in <strong className="text-[#0B3047]">{resendCountdown}s</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
