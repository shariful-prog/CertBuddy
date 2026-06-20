"use client";

import { createContext, useContext, useState } from "react";

/**
 * Lets a page inject content into the center of the global header
 * (e.g. the study/quiz tab switcher) without prop-drilling through
 * the server-rendered root layout.
 */
const HeaderSlotContext = createContext({ slot: null, setSlot: () => {} });

export function HeaderSlotProvider({ children }) {
  const [slot, setSlot] = useState(null);
  return (
    <HeaderSlotContext.Provider value={{ slot, setSlot }}>
      {children}
    </HeaderSlotContext.Provider>
  );
}

export function useHeaderSlot() {
  return useContext(HeaderSlotContext);
}
