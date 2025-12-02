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
        "flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white/80 transition-colors duration-200",
        hoverBgColor,
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md shadow-sm",
          iconBgColor
        )}
      >
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
