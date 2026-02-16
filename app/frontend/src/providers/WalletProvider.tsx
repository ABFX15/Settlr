"use client";

import { FC, ReactNode } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  return <>{children}</>;
};
