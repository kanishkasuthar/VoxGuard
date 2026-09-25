import { useState, useEffect } from "react";

export const networkStatusService = {
  isOnline() {
    return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true;
  },

  subscribe(callback) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(networkStatusService.isOnline());

  useEffect(() => {
    return networkStatusService.subscribe((status) => {
      setIsOnline(status);
    });
  }, []);

  return isOnline;
};
