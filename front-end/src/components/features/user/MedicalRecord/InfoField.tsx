import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface InfoFieldProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  iconColor?: string;
  iconBgColor?: string;
  hoverBgColor?: string;
  className?: string;
}

export default function InfoField({
  icon: Icon,
  label,
  value = "—",
  iconColor = "text-slate-600",
  iconBgColor = "bg-slate-100",
  hoverBgColor = "hover:bg-slate-50/50",
  className,
}: InfoFieldProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 rounded-xl border border-slate-200/60 bg-white/90 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md min-w-0 max-w-full",
        hoverBgColor,
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg shadow-sm shrink-0",
          iconBgColor
        )}
      >
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
      </div>
      <div className="flex-1 space-y-1 min-w-0 overflow-hidden">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 break-words">
          {label}
        </p>
        <p className="text-sm sm:text-base font-semibold text-slate-900 break-words overflow-wrap-anywhere">
          {value}
        </p>
      </div>
    </div>
  );
}
