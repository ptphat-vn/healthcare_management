import { motion } from "framer-motion";
import RegisterForm from "@/components/auth/RegisterForm/RegisterForm";
import bg_authen2 from "../../assets/images/bg_authen2.png";
import Bg_register from "../../assets/images/Bg_register.png";
import logo_HemoLab from "/logo_HemoLab.png";

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
    >
      <div className="flex flex-1 items-center justify-center px-7 relative z-10">
        <motion.div
          className="bg-white rounded-lg shadow-md p-4.5 max-w-md w-full relative z-20"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <div className="flex flex-col items-center space-y-1 mb-3">
            <div className="flex items-center gap-1">
              <img
                src={logo_HemoLab}
                alt="HemoLab"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
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
          <img
            src={logo_HemoLab}
            alt="HemoLab"
            className="w-20 h-20 sm:w-24 sm:h-24"
          />
          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              HemoLab Management
            </h1>
            <p className="text-xl text-gray-700 font-normal">
              Register to access your HemoLab system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
