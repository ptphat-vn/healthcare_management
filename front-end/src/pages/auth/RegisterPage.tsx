import { motion } from "framer-motion";
import RegisterForm from "@/components/auth/RegisterForm";
import bg_authen2 from "../../assets/images/bg_authen2.png";
import Bg_register from "../../assets/images/Bg_register.png";

export default function RegisterPage() {
  return (
    <div
      className="relative flex min-h-screen w-full"
      style={{
        backgroundImage: `url(${bg_authen2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: 0,
        padding: 0,
      }}
      //ádasdasdasdsa dsa
    >
      <div className="flex flex-1 items-center justify-center px-8 relative z-10">
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 max-w-md w-full relative z-20"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <div className="flex flex-col items-center space-y-1 mb-3">
            <div className="flex items-center gap-1">
              <svg width={50} height={50} viewBox="0 0 60 60" fill="none">
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
              Register Now
            </h2>
          </div>
          <RegisterForm />
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-col justify-center w-1/2 pr-16 py-12 overflow-hidden">
        <img
          src={Bg_register}
          className="absolute right-0 top-0 h-full w-[850px] object-cover z-0"
          alt="background"
          style={{ pointerEvents: "none" }}
        />
        <div className="relative z-10 flex items-center gap-4 mr-8 justify-end">
          <svg width={56} height={56} viewBox="0 0 56 56" fill="none">
            <path
              d="M6 32h10l6-16 12 40 6-24h10"
              stroke="#222"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              Laboratory Management
            </h1>
            <p className="text-xl text-gray-700 font-normal">
              Register to access your laboratory system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
