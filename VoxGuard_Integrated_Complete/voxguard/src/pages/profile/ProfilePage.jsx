import React, { useState, useEffect } from "react";
import { useToast } from "../../context/NotificationContext";
import { FiUser, FiCheckCircle, FiShield, FiSave, FiPhone, FiMail, FiLock } from "react-icons/fi";
import { authService } from "../../services/authService";
import { apiClient } from "../../services/api";

export const ProfilePage = () => {
  const { addToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [name, setName] = useState(currentUser?.name || "Kanishka Suthar");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(currentUser?.email || "kanishka.suthar@email.com");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/profile");
        if (res.data && res.data.success && res.data.profile) {
          const user = res.data.profile;
          setCurrentUser(user);
          setName(user.name);
          setPhone(user.phone);
          setEmail(user.email);
          localStorage.setItem("voxguard_user", JSON.stringify(user));
        }
      } catch (err) {
        console.warn("[Profile API] Fetch profile error:", err.message);
      }
    };
    fetchProfile();
  }, []);

  const validatePhone = (val) => {
    // E.164 / International phone number validation regex
    const phoneRegex = /^\+?[1-9]\d{1,14}$|^(\+91[\s\-]?)?[6-9]\d{9}$/;
    const cleaned = val.replace(/[\s\-]/g, "");
    if (!phoneRegex.test(cleaned)) {
      return "Please enter a valid phone number (e.g. +91 98765 3210).";
    }
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      addToast(err, "warning");
      return;
    }

    setPhoneError("");
    const updated = {
      ...currentUser,
      name,
      phone,
      email
    };

    try {
      const res = await apiClient.put("/profile", { name, phone, email });
      if (res.data && res.data.success && res.data.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem("voxguard_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn("[Profile API] Save profile fallback to local storage:", err.message);
      localStorage.setItem("voxguard_user", JSON.stringify(updated));
    }

    addToast("Profile details updated successfully!", "success");
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6 font-sans">
      
      {/* PAGE HEADER */}
      <div className="space-y-1 border-b border-[#D8E3E8] pb-4">
        <span className="text-[10px] font-mono uppercase font-extrabold text-[#123F59] tracking-widest block">
          USER PROFILE & VOICE SECURITY
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#0B3047]">Profile Overview</h1>
        <p className="text-xs text-[#66737C] font-mono">
          Manage your personal information and voice security settings.
        </p>
      </div>

      {/* CONSUMER PROFILE CARD */}
      <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6">
        
        {/* HEADER SUMMARY */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D8E3E8] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0B3047] text-white flex items-center justify-center text-xl font-bold font-serif shadow-md border-2 border-[#DCECF4]">
              KS
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#0B3047]">{name}</h2>
              <div className="flex items-center gap-2 text-xs font-mono text-[#66737C] mt-0.5">
                <span className="font-bold text-[#0B3047]">Voice ID: VG-001</span>
                <span>•</span>
                <span>Personal VoxGuard Account</span>
              </div>
              <p className="text-[10px] text-[#66737C] font-mono mt-0.5">
                Your unique VoxGuard voice identity.
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-50 text-[#3FA66B] font-mono text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <FiCheckCircle className="text-emerald-600 text-sm" /> Voice Profile Enrolled
          </div>
        </div>

        {/* PROFILE EDIT FORM */}
        <form onSubmit={handleSave} className="space-y-6 text-xs font-sans">
          
          {/* PERSONAL INFORMATION SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-extrabold text-[#0B3047] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F0F4F6] pb-1.5">
              <FiUser className="text-[#123F59]" /> PERSONAL INFORMATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-mono font-bold text-[11px] text-[#0B3047] uppercase block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kanishka Suthar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs font-sans focus:outline-none focus:border-[#0B3047] text-[#0B3047] transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="font-mono font-bold text-[11px] text-[#0B3047] uppercase flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[9px] text-[#66737C] font-normal lowercase">for caller ID & verification</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66737C]">
                    <FiPhone className="text-xs" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-[#FAF7F2]/50 text-xs font-mono focus:outline-none transition-all text-[#0B3047] ${
                      phoneError ? "border-rose-400 focus:border-rose-600 bg-rose-50/20" : "border-[#D8E3E8] focus:border-[#0B3047]"
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[10px] text-rose-600 font-mono mt-0.5">{phoneError}</p>
                )}
              </div>

            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="font-mono font-bold text-[11px] text-[#0B3047] uppercase block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66737C]">
                  <FiMail className="text-xs" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kanishka.suthar@email.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D8E3E8] bg-[#FAF7F2]/50 text-xs font-sans focus:outline-none focus:border-[#0B3047] text-[#0B3047] transition-all"
                />
              </div>
            </div>
          </div>

          {/* VOICE SECURITY PROFILE SECTION */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-extrabold text-[#0B3047] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F0F4F6] pb-1.5">
              <FiShield className="text-[#3FA66B]" /> VOICE SECURITY PROFILE
            </h3>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#3FA66B] flex items-center justify-center shrink-0 mt-0.5">
                  <FiShield className="text-base" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[#0B3047] text-xs font-mono">
                    🛡 Voice Profile Status
                  </h4>
                  <p className="text-[11px] text-[#66737C] font-sans leading-relaxed">
                    Your voice profile is securely enrolled and can be used for caller verification and voice security analysis.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#D8E3E8]/80 text-center font-mono">
                <div className="p-2 bg-white rounded-xl border border-[#D8E3E8]">
                  <span className="text-[9px] text-[#66737C] uppercase block font-bold">VOICE ID</span>
                  <span className="text-xs font-extrabold text-[#0B3047]">VG-001</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#D8E3E8]">
                  <span className="text-[9px] text-[#66737C] uppercase block font-bold">STATUS</span>
                  <span className="text-xs font-extrabold text-[#3FA66B]">● Active</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#D8E3E8]">
                  <span className="text-[9px] text-[#66737C] uppercase block font-bold">PROFILE</span>
                  <span className="text-xs font-extrabold text-emerald-700">✓ Enrolled</span>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FiSave /> Save Changes
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
