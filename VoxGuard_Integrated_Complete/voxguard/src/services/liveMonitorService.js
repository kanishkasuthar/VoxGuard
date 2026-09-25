import { MOCK_CALL_SESSIONS } from "../data/mockCalls";
import { mockDelay } from "./api";

export const liveMonitorService = {
  async getActiveSessions() {
    await mockDelay(300);
    return [...MOCK_CALL_SESSIONS];
  },

  async executeCallAction(callId, action) {
    await mockDelay(400);
    return {
      success: true,
      callId,
      action,
      timestamp: new Date().toISOString(),
      message: `Call ${callId} updated with action: ${action.toUpperCase()}`
    };
  },

  async getSessionById(callId) {
    await mockDelay(200);
    return MOCK_CALL_SESSIONS.find((c) => c.id === callId) || MOCK_CALL_SESSIONS[0];
  }
};
