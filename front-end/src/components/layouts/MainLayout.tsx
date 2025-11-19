import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";
import { socketService } from "@/services/socketService";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.data?._id;

  // Kết nối socket ngay khi vào MainLayout (sau khi đã login)
  useEffect(() => {
    if (userId) {
      // Connect socket và identify user
      socketService.connect();
      socketService.setUserId(userId, true);
      
      console.log('[MainLayout] Socket connected and identified for user:', userId);
    }

    // Cleanup: disconnect khi unmount (logout)
    return () => {
      // Không disconnect ở đây vì có thể navigate giữa các pages
      // Socket sẽ tự disconnect khi logout hoặc close browser
    };
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <SideBar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
