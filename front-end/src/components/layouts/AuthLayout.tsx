import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-wrapper flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Outlet />
      {/* ở đây để hiển thị các lỗi */}
    </div>
  );
}
