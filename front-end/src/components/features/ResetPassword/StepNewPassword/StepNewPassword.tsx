import { motion } from "framer-motion";
import Input from "@/components/ui/input/Input";

export default function StepNewPassword({
  identifier,
  password,
  setPassword,
  confirm,
  setConfirm,
  onSubmit,
  onBack,
  loading,
}: {
  identifier: string;
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <motion.form
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 w-full"
    >
      <h3 className="text-lg font-semibold">Set New Password</h3>

      <div className="w-full">
        <Input
          value={identifier}
          readOnly
          className="bg-gray-50 h-10 sm:h-11 text-sm sm:text-base w-full"
        />
      </div>

      <div className="w-full">
        <Input
          type="password"
          label="New password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 sm:h-11 text-sm sm:text-base w-full"
        />
      </div>

      <div className="w-full">
        <Input
          type="password"
          label="Confirm password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-10 sm:h-11 text-sm sm:text-base w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer btn-primary"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </motion.form>
  );
}
