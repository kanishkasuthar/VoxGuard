import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../context/NotificationContext";
import { FiLock, FiCheckCircle } from "react-icons/fi";

export const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }
    addToast("Password reset successfully! Please sign in.", "success");
    navigate("/login");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
          <FiLock />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">RESET YOUR PASSWORD</h2>
          <p className="text-xs text-slate-500">Enter your new secure password</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4 text-xs text-left">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            RESET PASSWORD
          </Button>
        </form>
      </Card>
    </div>
  );
};
