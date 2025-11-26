import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { loginSchema, type loginFormData } from "@/schemas/authSchema";
import { useForm } from "react-hook-form";
import { useLoginGoogleMutation, useLoginMutation } from "@/services/baseApi";
import { setAuth } from "@/stores/authSlice";
import { toast } from "sonner";
import Input from "../../ui/input/Input";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading }] = useLoginMutation();
  const [loginGoogle] = useLoginGoogleMutation();
  const navigate = useNavigate();

  const onSubmit = async (formData: loginFormData) => {
    try {
      const result = await login(formData).unwrap();
      dispatch(
        setAuth({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );

      toast.success(result?.message || "Đăng nhập thành công");
      navigate("/");
    } catch (error: any) {
      console.log("error login", error);

      toast.error(
        error.data?.message || "Đăng nhập thất bại, vui lòng thử lại",
        { duration: 4000 }
      );
    }
  };

  const handleSuccess = async (response: any) => {
    const { credential } = response;
    console.log(credential);

    try {
      const result = await loginGoogle({ tokenGoogle: credential }).unwrap();
      dispatch(
        setAuth({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      toast.success(result?.message || "Đăng nhập thành công");
      navigate("/");
    } catch (error: any) {
      console.log("error login", error);

      toast.error(
        error.data?.message || "Đăng nhập thất bại, vui lòng thử lại",
        { duration: 4000 }
      );
    }
  };

  return (
    <form
      className="space-y-4 sm:space-y-5 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Email Input */}
      <div className="w-full">
        <Input
          {...register("email")}
          label="Email"
          required
          error={errors.email?.message}
          placeholder="example123@gmail.com"
          className="h-10 sm:h-11 text-sm sm:text-base w-full"
        />
      </div>

      {/* Password Input */}
      <div className="w-full">
        <Input
          {...register("password")}
          type="password"
          label="Password"
          required
          error={errors.password?.message}
          placeholder="**********"
          className="h-10 sm:h-11 text-sm sm:text-base w-full"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] h-11 sm:h-12 px-4 sm:px-6 w-full text-sm sm:text-base shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Error Message */}
      {errors.root?.message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
          <p className="text-red-600 text-xs sm:text-sm text-center font-medium">
            {errors.root?.message}
          </p>
        </div>
      )}

      {/* Forgot Password Link */}
      <div className="text-center w-full pt-2">
        <Link
          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          to="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-xs sm:text-sm text-gray-600 w-full">
        Don't have an account?{" "}
        <Link
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          to="/auth/register"
        >
          Sign up
        </Link>
      </p>

      {/* Divider */}
      <div className="relative my-4 sm:my-6 w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="bg-white px-3 text-gray-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Login */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-full overflow-hidden">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GG_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {
                console.log("Login Failed");
              }}
              size="large"
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </form>
  );
}
