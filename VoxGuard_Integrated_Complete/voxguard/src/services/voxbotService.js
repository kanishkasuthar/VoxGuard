import { chatService } from "./chatService";

export const voxbotService = {
  async queryBot(userQuery, context = {}, history = []) {
    return await chatService.sendMessage(userQuery, history, context);
  }
};
