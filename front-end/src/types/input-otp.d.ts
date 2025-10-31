declare module "input-otp" {
  import * as React from "react";

  export interface OTPInputProps extends React.ComponentProps<"input"> {
    maxLength?: number;
    value?: string;
    onChange?: (value: string) => void;
    children?: React.ReactNode;
  }

  export const OTPInput: React.FC<OTPInputProps>;
  export interface OTPContextValue {
    slots?: Array<{ char?: string; isActive?: boolean }>;
  }
  export const OTPInputContext: React.Context<OTPContextValue | null>;
}


