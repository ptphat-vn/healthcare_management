/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/hooks/useAuth";
import { useStringeeToken } from "@/hooks/useStringeeCall";
import { StringeeContext } from "@/contexts/StringeeContext";
import IncomingCallModal from "@/components/features/videoCall/IncomingCallModal";
import { useEffect, useRef, useState } from "react";

// @ts-expect-error - Stringee SDK không có types
import { StringeeClient } from "stringee";

interface StringeeProviderProps {
  children: React.ReactNode;
}

export default function StringeeProvider({ children }: StringeeProviderProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user?.data?._id;

  // Chỉ fetch token khi đã đăng nhập
  const { token } = useStringeeToken();
  const stringeeClientRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    // Không khởi tạo nếu chưa đăng nhập
    if (!isLoggedIn || !token) return;

    // Tránh tạo client mới nếu đã có
    if (stringeeClientRef.current) {
      return;
    }

    const client = new StringeeClient();
    stringeeClientRef.current = client;

    client.on("connect", () => {
      console.log("StringeeProvider: Đã kết nối tới Stringee server");
    });

    client.on("authen", (res: any) => {
      if (res.message === "SUCCESS") {
        console.log("StringeeProvider: Đã xác thực thành công");
        setIsConnected(true);
      } else {
        console.log("StringeeProvider: Xác thực thất bại");
        setIsConnected(false);
      }
    });

    client.on("disconnect", () => {
      console.log("StringeeProvider: Đã ngắt kết nối");
      setIsConnected(false);
    });

    client.on("incomingcall2", (call: any) => {
      console.log("StringeeProvider: Có cuộc gọi đến từ:", call.fromNumber);
      setIncomingCall(call);
    });

    // Kết nối với Stringee server
    client.connect(token);

    return () => {
      const currentClient = stringeeClientRef.current;
      if (currentClient) {
        currentClient.disconnect();
        stringeeClientRef.current = null;
      }
    };
  }, [token, isLoggedIn]);

  const handleCloseIncomingCall = () => {
    setIncomingCall(null);
  };

  return (
    <StringeeContext.Provider
      value={{
        client: stringeeClientRef.current,
        isConnected,
      }}
    >
      {children}

      {/* Badge hiển thị trạng thái kết nối - chỉ hiện khi đã đăng nhập */}
      {isLoggedIn && isConnected && (
        <div className="fixed bottom-5 left-5 px-4 py-2 bg-gradient-to-r from-green-500/30 to-emerald-600/30 hover:from-green-500 hover:to-emerald-600 text-white/70 hover:text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl z-[9999] flex items-center gap-2 transition-all duration-300 cursor-pointer">
          <span className="w-2 h-2 bg-white/70 hover:bg-white rounded-full animate-pulse"></span>
          Sẵn sàng nhận cuộc gọi
        </div>
      )}

      {/* Modal cuộc gọi đến */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={() => {}}
          onReject={handleCloseIncomingCall}
        />
      )}
    </StringeeContext.Provider>
  );
}
