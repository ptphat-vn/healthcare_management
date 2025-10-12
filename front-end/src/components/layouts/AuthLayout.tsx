import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-wrapper w-full h-full">
      <Outlet />
      {/* ở đây để hiển thị các lỗi */}
    </div>
  );
}
