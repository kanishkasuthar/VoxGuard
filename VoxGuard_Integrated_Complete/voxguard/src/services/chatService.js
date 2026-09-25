import { aiService } from "./aiService";

export const chatService = {
  /**
   * Send user query to conversational AI engine with context and conversation history
   * @param {string} userQuery - User's natural language input
   * @param {Array} history - Full array of past conversation messages
   * @param {Object} context - Active page context and system telemetry
   */
  async sendMessage(userQuery, history = [], context = {}) {
    try {
      // In production mode, this would POST to /api/chat with server-side AI_API_KEY
      const textResponse = await aiService.generateResponse(userQuery, history, context);

      return {
        sender: "bot",
        text: textResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (err) {
      console.error("VoxBot Chat Service Error:", err);
      return {
        sender: "bot",
        text: "VoxBot couldn't connect right now. Please try again.",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }
};
