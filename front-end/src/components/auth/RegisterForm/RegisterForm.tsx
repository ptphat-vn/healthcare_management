import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { registerSchema, type registerFormData } from "@/schemas/authSchema";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/services/baseApi";
import { setAuth } from "@/stores/authSlice";
import { toast } from "sonner";
import Input from "../../ui/input/Input";

export default function RegisterForm() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<registerFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [registerMutation, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const onSubmit = async (formData: registerFormData) => {
    try {
      const { confirmPassword, ...payload } = formData;
      void confirmPassword;
      const result = await registerMutation(payload).unwrap();
      dispatch(
        setAuth({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      toast.success(result?.message || "Đăng ký thành công");
      navigate("/");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Đăng ký thất bại, vui lòng thử lại");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("fullName")}
          label="Full name"
          required
          error={errors.fullName?.message}
          placeholder="Nguyen Van A"
        />
        <Input
          {...register("email")}
          type="email"
          label="Email"
          required
          error={errors.email?.message}
          placeholder="example123@gmail.com"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("phoneNumber")}
            label="Phone number"
            required
            error={errors.phoneNumber?.message}
            placeholder="0123456789"
          />
          <Input
            {...register("identifyNumber")}
            label="Identify Number"
            required
            error={errors.identifyNumber?.message}
            placeholder="012345678901"
          />
        </div>
        <Input
          {...register("address")}
          label="Address"
          error={errors.address?.message}
          placeholder="123 Test Street"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("dateOfBirth")}
            type="date"
            label="Date of birth"
            required
            error={errors.dateOfBirth?.message}
          />
          <div className="flex flex-col w-full">
            <label htmlFor="gender" className="text-sm font-medium pb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              {...register("gender")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender?.message && (
              <span className="text-xs text-red-500 mt-1">
                {errors.gender.message}
              </span>
            )}
          </div>
        </div>
        <Input
          {...register("password")}
          type="password"
          label="Password"
          required
          error={errors.password?.message}
          placeholder="**********"
        />
        <Input
          {...register("confirmPassword")}
          type="password"
          label="Confirm Password"
          required
          error={errors.confirmPassword?.message}
          placeholder="**********"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
        {errors.root?.message && (
          <span className="text-xs text-red-500 break-words">
            {errors.root?.message}
          </span>
        )}
      </form>
      <p className="mt-3 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          className="font-medium text-blue-600 hover:text-blue-500"
          data-discover="true"
          to="/auth/login"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
