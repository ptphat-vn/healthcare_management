import { motion } from "framer-motion";

export default function StepEmail({
  identifier,
  setIdentifier,
  onSend,
  onBack,
  loading,
}: {
  identifier: string;
  setIdentifier: (v: string) => void;
  onSend: () => void;
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
        onSend();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="email-input" className="text-sm font-medium">Email</label>
        <input
          id="email-input"
          placeholder="example123@gmail.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer btn-primary"
        >
          {loading ? "Đang gửi..." : "Send Code"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Sign in
        </button>
      </div>
    </motion.form>
  );
}
