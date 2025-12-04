import { motion } from "framer-motion";
import Input from "@/components/ui/input/Input";

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
      className="space-y-4 w-full"
    >
      <Input
        id="email-input"
        type="email"
        label="Email"
        placeholder="example123@gmail.com"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Sign in
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer btn-primary"
        >
          {loading ? "Sending..." : "Send Code"}
        </button>
      </div>
    </motion.form>
  );
}
