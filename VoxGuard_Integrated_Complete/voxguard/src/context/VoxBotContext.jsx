import React, { createContext, useContext, useState } from "react";
import { chatService } from "../services/chatService";

const VoxBotContext = createContext(null);

export const VoxBotProvider = ({ children }) => {
  const initialWelcome = {
    id: 1,
    sender: "bot",
    text: "Hi! I'm VoxBot, your built-in voice security AI assistant. Ask me anything about VoxGuard, voice cloning, risk scores, incidents, or what's happening on your current screen.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([initialWelcome]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async (userQuery, context = {}) => {
    if (!userQuery.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsThinking(true);

    try {
      const res = await chatService.sendMessage(userQuery, updatedHistory, context);
      setMessages((prev) => [...prev, { ...res, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "VoxBot couldn't connect right now. Please try again.",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const regenerateLastResponse = async (context = {}) => {
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.sender === "user");
    if (lastUserIndex === -1) return;

    const actualUserIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[actualUserIndex];

    // Truncate messages to just before the bot's last response
    const truncatedHistory = messages.slice(0, actualUserIndex + 1);
    setMessages(truncatedHistory);
    setIsThinking(true);

    try {
      const res = await chatService.sendMessage(lastUserMsg.text, truncatedHistory, context);
      setMessages((prev) => [...prev, { ...res, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "VoxBot couldn't connect right now. Please try again.",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        ...initialWelcome,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <VoxBotContext.Provider
      value={{
        messages,
        isCollapsed,
        isThinking,
        sendMessage,
        regenerateLastResponse,
        clearChat,
        toggleCollapse,
        setIsCollapsed
      }}
    >
      {children}
    </VoxBotContext.Provider>
  );
};

export const useVoxBot = () => {
  const ctx = useContext(VoxBotContext);
  if (!ctx) {
    throw new Error("useVoxBot must be used within a VoxBotProvider");
  }
  return ctx;
};
