import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "number" | "date";
  value?: string;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export default function Input(props: InputProps) {
  const generatedId = React.useId();

  const {
    type = "text",
    value,
    placeholder,
    className,
    label,
    required,
    error,
    id,
    ...rest
  } = props;

  const inputId = id ?? generatedId;

  const baseClass =
    "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200";

  const errorClasses = error ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`${baseClass} ${className} ${errorClasses}`}
        type={type}
        value={value}
        placeholder={placeholder}
        {...rest}
      />

      {error && <p className="text-xs text-red-500 break-words">{error}</p>}
    </div>
  );
}
