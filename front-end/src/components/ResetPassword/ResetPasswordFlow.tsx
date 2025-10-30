import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import StepEmail from "@/components/ResetPassword/StepEmail";
import StepOTP from "@/components/ResetPassword/StepOTP";
import StepNewPassword from "@/components/ResetPassword/StepNewPassword";

import { useForgotPasswordMutation,
   useResetPasswordMutation
  } from "@/services/baseApi";
import type { ForgotPasswordRequest } from "@/types/request.type";
import { forgotPasswordSchema } from "@/schemas/authSchema";

type Step = 1 | 2 | 3;

export default function ResetPasswordFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") || "";

  const [step, setStep] = useState<Step>(1);
  const [identifier, setIdentifier] = useState(""); // email
  const [otp, setOtp] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  useEffect(() => {
    if (tokenFromUrl) setStep(3);
  }, [tokenFromUrl]);

  type ApiError = { data?: { message?: string } };

  const handleSendCode = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email: identifier });
    if (!parsed.success) {
      toast.error("Email không hợp lệ");
      return;
    }
    try {
      await forgotPassword({ email: (parsed.data as ForgotPasswordRequest).email }).unwrap();
      toast.success("We have sent you a message with the authentication code");
      setStep(2);
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(err.data?.message || "Gửi mã thất bại");
    }
  };
  
  // Hiện tại chưa verify OTP và nhảy sang step 3

  const handleVerifyOTP = async () => {
    const code = otp;
    if (code.length < 6) {
      toast.error("OTP phải có 6 chữ số");
      return;
    }
    toast.success("Xác thực OTP thành công");
  setStep(3);
  };

  const handleResend = async () => {
    if (!identifier) return;
    try {
      await forgotPassword({ email: identifier }).unwrap();
      toast.success("Đã gửi lại mã");
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(err.data?.message || "Gửi lại thất bại");
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!tokenFromUrl) {
      toast.error("Thiếu token. Vui lòng mở link đặt lại mật khẩu trong email.");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      const res = await resetPassword({ token: tokenFromUrl, newPassword: password }).unwrap();
      toast.success(res?.message || "Đặt lại mật khẩu thành công");
      navigate("/auth/login");
    } catch (e: unknown) {
      const err = e as ApiError;
      toast.error(err.data?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
      <div className="relative overflow-hidden">
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
          loading={sending}
        />
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in-left">
        <StepNewPassword
          identifier={identifier || "(mở từ link reset)"}
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