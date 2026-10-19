import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// "بوابة" الاحتفالات: شاشة Level-Up عامة (في ChildLayout) بتتأجّل طول ما فيه شاشة أهم مفتوحة
// (زي شاشة المكافأة بتاعة اللعبة)، عشان الطفل يشوف مكافأته الأول وبعدين الاحتفال — مش فوق بعض.
const Ctx = createContext({ holds: 0, hold: () => () => {} });

export function CelebrationProvider({ children }) {
  const [holds, setHolds] = useState(0);
  const hold = useCallback(() => {
    setHolds((h) => h + 1);
    return () => setHolds((h) => Math.max(0, h - 1));
  }, []);
  const value = useMemo(() => ({ holds, hold }), [holds, hold]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCelebrations = () => useContext(Ctx);

/** استدعيها في أي شاشة مكافأة/لعبة: الاحتفال العام بيستنى لحد ما تتقفل. */
export function useCelebrationHold(active = true) {
  const { hold } = useContext(Ctx);
  useEffect(() => (active ? hold() : undefined), [active, hold]);
}