/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from "react";

interface StringeeContextType {
  client: any;
  isConnected: boolean;
}

export const StringeeContext = createContext<StringeeContextType | null>(null);

export const useStringee = () => {
  const context = useContext(StringeeContext);
  if (!context) {
    throw new Error("useStringee must be used within StringeeProvider");
  }
  return context;
};
