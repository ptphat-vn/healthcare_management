import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import StepEmail from "../StepEmail/StepEmail";
import StepOTP from "../StepOTP/StepOTP";
import StepNewPassword from "../StepNewPassword/StepNewPassword";

import {
  useForgotPasswordMutation,
  useVerifyResetTokenMutation,
  useResetPasswordMutation,
} from "@/services/baseApi";
import type {
  ForgotPasswordRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
} from "@/types/request.type";
import { forgotPasswordSchema } from "@/schemas/authSchema";

type Step = 1 | 2 | 3;

export default function ResetPasswordFlow() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [identifier, setIdentifier] = useState(""); // email
  const [otp, setOtp] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [verifyResetToken, { isLoading: verifying }] = useVerifyResetTokenMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  type ApiError = { data?: { message?: string } };

  const handleSendCode = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email: identifier });
    if (!parsed.success) {
      toast.error("Email không hợp lệ");
      return;
    }
    try {
      await forgotPassword({
        email: (parsed.data as ForgotPasswordRequest).email,
      }).unwrap();
      toast.success("We have sent you a message with the authentication code");
      setStep(2);
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(`Send Code Failed: ${err.data?.message || "Unknown error"}`);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    if (!identifier) {
      toast.error("Missing email. Please enter email at step 1.");
      setStep(1);
      return;
    }
    try {
      const body: VerifyResetTokenRequest = {
        email: identifier,
        otp,
      };
      await verifyResetToken(body).unwrap();
      toast.success("OTP verified successfully");
      setStep(3);
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(
        `OTP Verification Failed: ${err.data?.message || "Invalid or expired OTP"}`
      );
    }
  };

  const handleResend = async () => {
    if (!identifier) return;
    try {
      await forgotPassword({ email: identifier }).unwrap();
      toast.success("Code resent successfully");
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(
        `Resend Code Failed: ${err.data?.message || "Unknown error"}`
      );
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!identifier) {
      toast.error("Missing email. Please enter email at step 1.");
      setStep(1);
      return;
    }
    if (!otp || otp.length < 6) {
      toast.error("Missing/Invalid OTP. Please enter again at step 2.");
      setStep(2);
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Confirm password does not match");
      return;
    }

    try {
      const body: ResetPasswordRequest = {
        email: identifier,
        otp,
        newPassword: password,
      };
      const res = await resetPassword(body).unwrap();
      toast.success(res?.message || "Reset password successfully");
      navigate("/auth/login");
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(
        `Reset Password Failed: ${err.data?.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="relative overflow-hidden px-1">
      <div className="space-y-6">
        {step === 1 && (
          <div className="animate-in fade-in-up">
            <StepEmail
              identifier={identifier}
              setIdentifier={setIdentifier}
              onSend={handleSendCode}
              onBack={() => navigate("/auth/login")}
              loading={sending}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in-right">
            <StepOTP
              otp={otp}
              setOtp={setOtp}
              onVerify={handleVerifyOTP}
              onResend={handleResend}
              onBack={() => setStep(1)}
              loading={verifying || sending}
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in-left">
            <StepNewPassword
              identifier={identifier}
              password={password}
              setPassword={setPassword}
              confirm={confirm}
              setConfirm={setConfirm}
              onSubmit={handleSubmitNewPassword}
              onBack={() => setStep(2)}
              loading={resetting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
