import { motion } from "framer-motion";
import LoginForm from "@/components/auth/loginForm/LoginForm";
import bg_authen from "../../assets/images/bg_authen.png";
import bg_login from "../../assets/images/bg_login.png";

export default function LoginPage() {
  return (
    <div
      className="relative flex flex-col lg:flex-row min-h-screen"
      style={{
        backgroundImage: `url(${bg_authen})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Left Section - Hero */}
      <div className="hidden lg:flex flex-col justify-center w-full lg:w-1/2 px-8 lg:pl-16 py-12 overflow-hidden">
        <img
          src={bg_login}
          className="absolute inset-0 w-full lg:w-[850px] h-full object-cover z-0"
          alt="background"
        />
        <div className="relative z-10 flex items-center gap-4 ml-0 lg:ml-8">
          <svg
            width={56}
            height={56}
            viewBox="0 0 56 56"
            fill="none"
            className="w-12 h-12 lg:w-14 lg:h-14"
          >
            <path
              d="M6 32h10l6-16 12 40 6-24h10"
              stroke="#222"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 mb-1">
              Laboratory Management
            </h1>
            <p className="text-base lg:text-xl text-gray-700 font-normal">
              Sign in to access your laboratory system
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
        <motion.div
          className="bg-white/90 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 space-y-6 lg:space-y-8 w-full max-w-md lg:h-[600px] backdrop-blur-md lg:mr-24 flex flex-col justify-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          {/* Mobile Logo */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <svg
                width={48}
                height={48}
                viewBox="0 0 56 56"
                fill="none"
                className="w-10 h-10 sm:w-12 sm:h-12"
              >
                <path
                  d="M6 32h10l6-16 12 40 6-24h10"
                  stroke="#222"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Show title on mobile */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 lg:hidden text-center">
              Laboratory Management
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Login to continue
            </h2>
          </div>
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
