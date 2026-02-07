import { useState, useEffect } from "react";

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      console.warn("LocalStorage error:", e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, [key, state]);

  return [state, setState];
}