import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ 
  title, 
  description,
  icon,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-500 py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <p className="text-lg font-medium">{title}</p>
      {description && (
        <p className="text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
