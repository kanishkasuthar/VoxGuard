import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { authService } from "../../services/authService";
import { useToast } from "../../context/NotificationContext";
import { FiMail, FiArrowLeft } from "react-icons/fi";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("sarah.jenkins@voxguard.ai");
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authService.forgotPassword(email);
    setSubmitted(true);
    addToast("Password reset link sent to your email.", "success");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
          <FiMail />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">FORGOT PASSWORD</h2>
          <p className="text-xs text-slate-500">Enter your email to receive a secure reset link</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
            <p className="font-bold">Reset Link Dispatched!</p>
            <p className="text-[11px] text-slate-600">Please check your inbox for instructions.</p>
            <Link to="/reset-password">
              <Button variant="secondary" size="sm" className="mt-2">
                Go to Reset Form
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              SEND RESET LINK
            </Button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100">
          <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
            <FiArrowLeft /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
