import React from "react";
import { motion } from "framer-motion";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function StepOTP({
  otp,
  setOtp,
  onVerify,
  onResend,
  onBack,
  loading,
}: {
  otp: string;
  setOtp: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const handleResendClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onResend();
  };

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative"
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute top-0 left-0 h-8 w-9 flex items-center justify-center rounded-md
                   text-gray-500 hover:text-gray-800 hover:bg-gray-300"
        aria-label="Back"
      >
        ←
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onVerify();
        }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Nhập mã xác thực</h3>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(v: string) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="submit"
          disabled={loading || otp.replace(/\D/g, "").length < 6}
          className="cursor-pointer w-full h-10 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground mt-2">
        Didn't receive code?{" "}
        <button
          type="button"
          onClick={handleResendClick}
          onMouseDown={(e) => e.preventDefault()}
          className="cursor-pointer font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          Resend Code
        </button>
      </p>
    </motion.div>
  );
}