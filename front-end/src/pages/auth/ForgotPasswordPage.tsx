import { motion } from "framer-motion";
import bg_authen from "@/assets/images/bg_authen.png";
import bg_login from "@/assets/images/bg_login.png";
import ResetPasswordFlow from "@/components/features/ResetPassword/ResetPasswordFlow/ResetPasswordFlow";

export default function ForgotPasswordPage() {
  return (
    <div
      className="relative flex min-h-screen"
      style={{
        backgroundImage: `url(${bg_authen})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hidden lg:flex flex-col justify-center w-1/2 pl-16 py-12 overflow-hidden">
        <img
          src={bg_login}
          className="absolute inset-0 w-[850px] h-full object-cover z-0"
          alt="background"
        />
        <div className="relative z-10 flex items-center gap-4 ml-8">
          <svg width={56} height={56} viewBox="0 0 56 56" fill="none">
            <path
              d="M6 32h10l6-16 12 40 6-24h10"
              stroke="#222"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              Laboratory Management
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <motion.div
          className="bg-white/90 rounded-xl shadow-2xl p-8 space-y-6 max-w-md w-full backdrop-blur-md"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <ResetPasswordFlow />
        </motion.div>
      </div>
    </div>
  );
}
