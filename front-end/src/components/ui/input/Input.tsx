import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "number";
  value?: string;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
}
export default function Input({
  type = "text",
  value,
  placeholder,
  className,
  label,
  required,
  error,
  ...rest
}: InputProps) {
  const baseClass =
    "mt-1 flex h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50  ";
  const errorClasses = error ? "border-red-500 focus-visible:ring-red-500" : "";
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`${baseClass} + ${className} + ${errorClasses}`}
        type={type}
        value={value}
        name="email"
        placeholder={placeholder}
        {...rest}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
