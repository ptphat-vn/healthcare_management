/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from "react";

interface StringeeContextType {
  client: any;
  isConnected: boolean;
}

export const StringeeContext = createContext<StringeeContextType>({
  client: null,
  isConnected: false,
});

export const useStringee = () => {
  const context = useContext(StringeeContext);
  return context;
};
