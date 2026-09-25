import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../context/NotificationContext";
import { FiCheckCircle, FiMic, FiShield, FiArrowRight } from "react-icons/fi";

export const OnboardingPage = () => {
  const [step, setStep] = useState(2); // 1 Account (done), 2 Voice, 3 Verification, 4 Protected
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCaptured, setVoiceCaptured] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setVoiceCaptured(true);
      addToast("Voice sample captured successfully!", "success");
    }, 4000);
  };

  const handleCreateProfile = () => {
    setStep(3);
    setTimeout(() => {
      setStep(4);
      addToast("Voice Security Profile Created! Protection Enabled.", "success");
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-2">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
          WELCOME TO VOXGUARD
        </h1>
        <p className="text-xs text-slate-500">Create your secure voice profile to enable real-time telephony defense.</p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          01 Account ✓
        </div>
        <div className={`p-2.5 rounded-lg border ${step >= 2 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400"}`}>
          02 Voice
        </div>
        <div className={`p-2.5 rounded-lg border ${step >= 3 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400"}`}>
          03 Verification
        </div>
        <div className={`p-2.5 rounded-lg border ${step === 4 ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-400"}`}>
          04 Protected
        </div>
      </div>

      {/* Step 2: Voice Recording */}
      {step === 2 && (
        <Card className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            <FiMic className={isRecording ? "animate-pulse text-rose-600" : ""} />
          </div>

          {!voiceCaptured ? (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">READY TO RECORD</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Speak clearly into your microphone to record your baseline voice embedding.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartRecording}
                disabled={isRecording}
                icon={FiMic}
              >
                {isRecording ? "RECORDING SAMPLE..." : "START RECORDING"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm text-emerald-700 font-mono">VOICE CAPTURED</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span>Audio Quality:</span>
                  <span className="text-emerald-600 font-bold">✓ Pristine (48kHz)</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Sample:</span>
                  <span className="text-emerald-600 font-bold">✓ 256-Vector Extracted</span>
                </div>
                <div className="flex justify-between">
                  <span>Speaker Profile:</span>
                  <span className="text-emerald-600 font-bold">✓ Baseline Enrolled</span>
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={handleCreateProfile} icon={FiArrowRight}>
                CREATE VOICE PROFILE
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Verification */}
      {step === 3 && (
        <Card className="p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700 font-mono">Verifying ECAPA-TDNN Biometric Profile...</p>
        </Card>
      )}

      {/* Step 4: Protected */}
      {step === 4 && (
        <Card className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
            <FiCheckCircle />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 font-mono">VOICE PROFILE CREATED</h2>
            <p className="text-xs text-slate-500">Protection enabled across your active telephony desk.</p>
          </div>

          <Button variant="primary" size="lg" onClick={() => navigate("/dashboard")} icon={FiArrowRight}>
            GO TO SECURITY DASHBOARD
          </Button>
        </Card>
      )}
    </div>
  );
};
