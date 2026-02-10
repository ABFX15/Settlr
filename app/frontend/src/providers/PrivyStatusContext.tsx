"use client";

import { createContext, useContext } from "react";

interface PrivyStatus {
  /** true once the real PrivyProvider wrapper is rendered around children */
  available: boolean;
}

export const PrivyStatusContext = createContext<PrivyStatus>({
  available: false,
});

export function usePrivyStatus() {
  return useContext(PrivyStatusContext);
}
