import { motion } from "framer-motion";

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
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">Đặt mật khẩu mới</h3>
      <input
        value={identifier}
        readOnly
        className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50"
      />
      <input
        placeholder="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        placeholder="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer btn-primary"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
    </motion.form>
  );
}
