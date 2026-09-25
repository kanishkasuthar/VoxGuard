import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("voxguard_theme") || "light";
  });

  const [effectiveTheme, setEffectiveTheme] = useState("light");

  useEffect(() => {
    const updateTheme = () => {
      let resolved = theme;
      if (theme === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      setEffectiveTheme(resolved);

      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        document.body.setAttribute("data-theme", "light");
      }

      console.log("[VOXGUARD THEME DEBUG]", {
        CURRENT_THEME: resolved,
        ROOT_HAS_DARK: document.documentElement.classList.contains("dark"),
        documentClassName: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute("data-theme"),
        localStorageTheme: localStorage.getItem("voxguard_theme")
      });
    };

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    console.log("[VOXGUARD THEME DEBUG]", {
      CLICK_DETECTED: "YES",
      REQUESTED_THEME: newTheme,
      CURRENT_THEME_BEFORE: effectiveTheme
    });
    setThemeState(newTheme);
    localStorage.setItem("voxguard_theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

