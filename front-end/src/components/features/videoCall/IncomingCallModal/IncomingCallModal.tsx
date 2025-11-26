/* eslint-disable @typescript-eslint/no-explicit-any */
import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetBasicUserInfoQuery } from "@/services/userApi";

interface IncomingCallModalProps {
  call: any;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  call,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const [callStatus, setCallStatus] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Lấy thông tin người gọi từ backend (endpoint không yêu cầu privilege)
  const { data: userData } = useGetBasicUserInfoQuery(
    { id: call?.fromNumber || "" },
    { skip: !call?.fromNumber }
  );

  // Hiển thị tên người gọi, fallback về ID nếu không có
  const callerName =
    userData?.data?.fullName || call?.fromNumber || "Người dùng";

  console.log("Caller data:", {
    userData,
    callerName,
    fromNumber: call?.fromNumber,
  });

  useEffect(() => {
    if (!call) return;

    // Thiết lập các event cho cuộc gọi
    call.on("addremotestream", (stream: MediaStream) => {
      console.log("Remote stream received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = stream;
      }
    });

    call.on("addlocalstream", (stream: MediaStream) => {
      console.log("Local stream added");
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.srcObject = stream;
      }
    });

    call.on("signalingstate", (state: any) => {
      console.log("Signaling state:", state);
      setCallStatus(state.reason);
      if ([4, 5, 6].includes(state.code)) {
        // Cuộc gọi kết thúc
        setTimeout(() => {
          onReject();
        }, 1000);
      }
    });

    call.on("mediastate", (state: any) => {
      console.log("Media state:", state);
    });
  }, [call, onReject]);

  const handleAccept = () => {
    setIsAnswered(true);
    call.answer((res: any) => {
      console.log("Answer call result:", res);
      setCallStatus("Đã kết nối");
    });
    onAccept();
  };

  const handleReject = () => {
    call.reject((res: any) => {
      console.log("Reject call result:", res);
    });
    onReject();
  };

  const handleHangup = () => {
    call.hangup((res: any) => {
      console.log("Hangup result:", res);
    });
    onReject();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        {!isAnswered ? (
          // Màn hình cuộc gọi đến
          <div className="p-4 sm:p-8 text-center">
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <Video className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
              📞 Cuộc gọi video đến
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Từ: <span className="font-semibold">{callerName}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
              <button
                onClick={handleAccept}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                Trả lời
              </button>
              <button
                onClick={handleReject}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3"
              >
                <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                Từ chối
              </button>
            </div>
          </div>
        ) : (
          // Màn hình đang gọi
          <div className="relative">
            {/* Remote video - video của người gọi */}
            <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-900">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {callStatus && (
                <div className="absolute top-3 sm:top-6 left-1/2 transform -translate-x-1/2 px-3 sm:px-6 py-2 sm:py-3 bg-black/60 text-white rounded-full backdrop-blur-sm">
                  <div className="text-center">
                    <div className="font-semibold text-sm sm:text-lg">
                      {callerName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      {callStatus}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Local video - video của bạn (picture-in-picture) */}
            <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-6 w-24 h-32 sm:w-40 sm:h-32 md:w-56 md:h-40 bg-gray-800 rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 sm:bottom-3 left-1 sm:left-3 text-xs sm:text-sm text-white bg-black/60 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm">
                Bạn
              </div>
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handleHangup}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-bold text-sm sm:text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-110 transition-all duration-200 flex items-center gap-2 sm:gap-3"
              >
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Kết thúc cuộc gọi</span>
                <span className="sm:hidden">Kết thúc</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
