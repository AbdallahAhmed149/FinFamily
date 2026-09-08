import { useEffect, useState, useCallback } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("ff-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("ff-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, setDark, toggle };
}