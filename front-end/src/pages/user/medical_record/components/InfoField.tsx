import type { LucideIcon } from "lucide-react";

interface InfoFieldProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBgColor?: string;
  hoverBgColor?: string;
  className?: string;
}

export default function InfoField({
  icon: Icon,
  label,
  value,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  hoverBgColor = "hover:bg-blue-50/50",
  className = "",
}: InfoFieldProps) {
  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg ${hoverBgColor} transition-colors duration-200 group ${className}`}
    >
      <div
        className={`p-1.5 sm:p-2 ${iconBgColor} rounded-lg group-hover:opacity-80 transition-colors shrink-0`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
