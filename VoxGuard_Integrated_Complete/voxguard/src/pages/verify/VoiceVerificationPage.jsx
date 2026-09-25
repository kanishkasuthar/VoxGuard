import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { VoiceFingerprint } from "../../components/visualizations/VoiceFingerprint";
import { useToast } from "../../context/NotificationContext";
import { FiCheckCircle, FiMic, FiShield, FiLock, FiCpu, FiUser, FiArrowRight } from "react-icons/fi";

export const VoiceVerificationPage = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, 4
  const [formData, setFormData] = useState({
    officerName: "Sarah Jenkins",
    department: "Treasury & Finance Operations",
    passphrase: "My voice is my password and biometric signature."
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const { addToast } = useToast();

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTimer(0);
    const interval = setInterval(() => {
      setRecordingTimer((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          setIsRecording(false);
          setCurrentStep(3);
          addToast("Sample recorded! Running ECAPA-TDNN embedding extraction...", "info");
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleFinalizeProfile = () => {
    setCurrentStep(4);
    addToast("SECURE VOICE IDENTITY PROFILE CREATED & SEALED!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FiShield className="text-blue-600" /> SECURE VOICE IDENTITY
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enroll authorized personnel biometric voiceprints into zero-knowledge encrypted SOC vault.
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: "1. Basic Info" },
          { num: 2, title: "2. Record Voice" },
          { num: 3, title: "3. Voice Analysis" },
          { num: 4, title: "4. Profile Created" }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              currentStep === s.num
                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                : currentStep > s.num
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            <span className="text-xs">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-4 max-w-xl mx-auto">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FiUser className="text-blue-600" /> Executive & Officer Details
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.officerName}
                onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department Desk</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Voice Passphrase Prompt</label>
              <input
                type="text"
                readOnly
                value={formData.passphrase}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono bg-slate-50 text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" icon={FiArrowRight} onClick={() => setCurrentStep(2)}>
              Proceed to Voice Recording
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Record Voice */}
      {currentStep === 2 && (
        <Card className="p-8 text-center space-y-5 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            <FiMic className={isRecording ? "animate-pulse text-rose-600" : ""} />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Read the Passphrase Aloud</h3>
            <p className="text-xs text-slate-600 font-mono italic bg-slate-50 p-3 rounded border border-slate-200">
              "{formData.passphrase}"
            </p>
          </div>

          {isRecording ? (
            <div className="space-y-2">
              <div className="text-2xl font-mono font-extrabold text-blue-600">00:0{recordingTimer} / 00:10</div>
              <p className="text-xs text-slate-400">Capturing micro-vocal tremor baseline...</p>
            </div>
          ) : (
            <Button variant="primary" size="lg" icon={FiMic} onClick={handleStartRecording}>
              Start 10-Second Recording
            </Button>
          )}
        </Card>
      )}

      {/* Step 3: Voice Analysis */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <VoiceFingerprint isMatch={true} />

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Biometric Embedding Quality
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-sans text-slate-400 block">Signal-to-Noise</span>
                <span className="font-extrabold text-emerald-600 text-lg">38 dB (Pristine)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-sans text-slate-400 block">Embedding Dims</span>
                <span className="font-extrabold text-blue-600 text-lg">256 Vectors</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-sans text-slate-400 block">Glottal Print</span>
                <span className="font-extrabold text-slate-800 text-lg">Verified</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md" icon={FiCheckCircle} onClick={handleFinalizeProfile}>
                Confirm & Seal Voice Identity Profile
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 4: Profile Created */}
      {currentStep === 4 && (
        <Card className="p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
            <FiCheckCircle />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">VOICE PROFILE CREATED</h2>
            <p className="text-xs text-slate-500">
              Encrypted voice identity embedding vaulted into SOC biometric registry.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 space-y-1 text-left">
            <div><strong>Profile Hash:</strong> 0x9f8a7b6c5d4e3f2a1b0c9d8e</div>
            <div><strong>Status:</strong> Active & Enrolled</div>
          </div>

          <div className="pt-2">
            <Button variant="secondary" size="md" onClick={() => setCurrentStep(1)}>
              Enroll Another Profile
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
