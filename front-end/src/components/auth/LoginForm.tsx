import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { loginSchema, type loginFormData } from "@/schemas/authSchema";
import { useForm } from "react-hook-form";
import { useLoginGoogleMutation, useLoginMutation } from "@/services/baseApi";
import { setAuth } from "@/stores/authSlice";
import { toast } from "sonner";
import Input from "../ui/input/Input";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginForm() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
  });
  // useForm bao gom register, handleSubmit, setError

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
    const { credential } = response; //Nhận ID token từ Google
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
    <form className="space-y-4 " onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          {...register("email")}
          label="Email"
          required
          error={errors.email?.message}
          placeholder="example123@gmail.com"
        />
      </div>
      <div>
        <Input
          {...register("password")}
          type="password"
          label="Password"
          required
          error={errors.password?.message}
          placeholder="**********"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full"
      >
        {isLoading ? " Signing..." : "Sign In"}
      </button>
      {errors.root?.message && (
        <span className="text-red-400 text-xs">{errors.root?.message}</span>
      )}
      <p className="mt-2 text-center text-sm text-gray-600">
        <Link
          className="font-medium text-blue-600 hover:text-blue-500"
          to="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          className="font-medium text-blue-600 hover:text-blue-500"
          data-discover="true"
          to="/auth/register"
        >
          Sign up
        </Link>
      </p>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GG_CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </form>
  );
}
