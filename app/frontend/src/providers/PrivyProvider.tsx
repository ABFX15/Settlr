"use client";

import { ReactNode } from "react";

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  return <>{children}</>;
}
