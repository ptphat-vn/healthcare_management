import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

export function InputOTP({ className, ...props }: React.ComponentProps<typeof OTPInput>) {
  return <OTPInput className={cn("flex items-center gap-3", className)} {...props} />;
}

export function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3", className)} {...props} />;
}

export const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTP = React.useContext(OTPInputContext);
  const slot = inputOTP?.slots?.[index];
  const char = slot?.char ?? "";
  const isActive = slot?.isActive ?? false;

  return (
    <div
      ref={ref}
      className={cn(
        "w-12 h-12 rounded-md border border-gray-300 bg-white",
        "flex items-center justify-center text-xl",
        isActive && "ring-2 ring-blue-500 border-blue-500",
        className
      )}
      {...props}
    >
      {char ? (
        <span className="select-none">{char}</span>
      ) : isActive ? (
        <span aria-hidden className="block w-px h-5 bg-blue-600 animate-pulse" />
      ) : (
        <span className="opacity-0">0</span>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";


