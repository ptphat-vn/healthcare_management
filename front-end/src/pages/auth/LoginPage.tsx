import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import bg_authen from "../../assets/images/bg_authen.png";
import bg_login from "../../assets/images/bg_login.png";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen"
      style={{
        backgroundImage: `url(${bg_authen})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col justify-center w-1/2 pl-16 py-12 overflow-hidden">
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
            <p className="text-xl text-gray-700 font-normal">
              Sign in to access your laboratory system
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="bg-white/90 rounded-xl shadow-2xl p-10 space-y-8 max-w-md w-full h-[500px] backdrop-blur-md mr-24 flex flex-col justify-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <svg width={48} height={48} viewBox="0 0 56 56" fill="none">
                <path
                  d="M6 32h10l6-16 12 40 6-24h10"
                  stroke="#222"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Login to continue
            </h2>
          </div>
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
