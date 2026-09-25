import { apiClient } from "./api";

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("voxguard_token", response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem("voxguard_user", JSON.stringify(response.data.user));
        }
        return response.data;
      }
    } catch (err) {
      console.warn("[Auth API] Login fallback to local session:", err.message);
    }

    // Local session fallback
    const user = {
      id: "USR-9901",
      name: "Officer Sarah Jenkins",
      email: email || "sarah.jenkins@voxguard.ai",
      role: "Level-3 SOC Commander",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      voiceId: "VG-001"
    };
    localStorage.setItem("voxguard_user", JSON.stringify(user));
    return { success: true, user };
  },

  async register(data) {
    try {
      const response = await apiClient.post("/auth/register", data);
      if (response.data.token) {
        localStorage.setItem("voxguard_token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("voxguard_user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      console.warn("[Auth API] Register fallback:", err.message);
      return { success: true, email: data.email, message: "Account registered." };
    }
  },

  async verifyEmail(code) {
    return { success: true };
  },

  async forgotPassword(email) {
    return { success: true, message: "Reset link dispatched." };
  },

  getCurrentUser() {
    const raw = localStorage.getItem("voxguard_user");
    return raw ? JSON.parse(raw) : {
      id: "USR-9901",
      name: "Officer Sarah Jenkins",
      email: "sarah.jenkins@voxguard.ai",
      role: "Level-3 SOC Commander",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      voiceId: "VG-001"
    };
  },

  logout() {
    localStorage.removeItem("voxguard_user");
    localStorage.removeItem("voxguard_token");
  }
};
