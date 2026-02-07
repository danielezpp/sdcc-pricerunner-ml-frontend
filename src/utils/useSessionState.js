import { useState, useEffect } from "react";

export function useSessionState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      console.warn("SessionStorage error:", e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("SessionStorage save error:", e);
    }
  }, [key, state]);

  return [state, setState];
}