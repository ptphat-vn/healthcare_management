interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-indigo-500 mb-4 ${sizeClasses[size]}`}
        ></div>
        <div className="text-lg text-gray-600">{message}</div>
      </div>
    </div>
  );
}
