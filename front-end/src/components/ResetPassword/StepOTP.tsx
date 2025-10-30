import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  const length = 6;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);

  const digits = useMemo(() => otp.replace(/\D/g, "").slice(0, length), [otp]);
  const cells = useMemo(
    () => Array.from({ length }, (_, i) => digits[i] || ""),
    [digits, length]
  );

  const syncCaret = () => {
    const pos = inputRef.current?.selectionStart ?? digits.length;
    setCaret(Math.max(0, Math.min(pos || 0, length)));
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const ne = e.nativeEvent as InputEvent;
    const data = (ne?.data ?? "");
    const raw = e.target.value.replace(/\D/g, "");

    // Overwrite character at caret when already full and a single digit is typed
    if (digits.length === length && /^[0-9]$/.test(data)) {
      const sel = e.target.selectionStart ?? length;
      const i = Math.max(0, Math.min((sel - 1), length - 1));
      const chars = digits.split("");
      chars[i] = data;
      const finalVal = chars.join("");
      setOtp(finalVal);
      requestAnimationFrame(() => {
        const newPos = Math.min(i + 1, length);
        inputRef.current?.setSelectionRange(newPos, newPos);
        setCaret(newPos);
      });
      return;
    }

    // Normal path: deletions, paste, or not yet full
    const next = raw.slice(0, length);
    setOtp(next);
    requestAnimationFrame(syncCaret);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
    requestAnimationFrame(syncCaret);
  };

  const handleCellClick = (i: number) => {
      inputRef.current?.focus();
      const pos = Math.min(i, digits.length);
      inputRef.current?.setSelectionRange(pos, Math.min(pos + 1, digits.length));
     setCaret(pos);
    };

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

        <div
          role="group"
          aria-label="OTP input"
          className="relative"
          onClick={handleContainerClick}
        >
          <input
            ref={inputRef}
            value={digits}
            onChange={handleChange}
            onFocus={() => { setFocused(true); requestAnimationFrame(syncCaret); }}
            onBlur={() => setFocused(false)}
            onKeyUp={syncCaret}
            maxLength={length}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="One-time password"
            className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 outline-none"
            style={{ top: 0, left: 0, position: "absolute" }}
          />

          <div className="flex justify-center gap-3">
            {cells.map((ch, i) => {
              const caretCell = Math.min(caret, length - 1);
              const isActive = focused && i === caretCell;
              return (
                <div
                  key={i}
                  onClick={() => handleCellClick(i)}
                  className={`w-12 h-12 rounded-md border border-gray-300 bg-white
                              flex items-center justify-center text-xl cursor-text
                              ${isActive ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                >
                  {ch ? (
                    <span className="select-none">{ch}</span>
                  ) : isActive ? (
                    <span
                      aria-hidden="true"
                      className="block w-px h-5 bg-blue-600 animate-pulse"
                    />
                  ) : (
                    <span className="opacity-0">0</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || digits.length < length}
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