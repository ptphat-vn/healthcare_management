/* eslint-disable @typescript-eslint/no-explicit-any */
import { PhoneOff } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface VideoCallModalProps {
  call: any;
  onHangup: () => void;
  recipientName?: string;
}

export default function VideoCallModal({
  call,
  onHangup,
  recipientName,
}: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState("Đang gọi...");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!call) return;

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
          onHangup();
        }, 1000);
      }
    });

    call.on("mediastate", (state: any) => {
      console.log("Media state:", state);
    });
  }, [call, onHangup]);

  const handleHangup = () => {
    if (call) {
      call.hangup((res: any) => {
        console.log("Hangup result:", res);
      });
    }
    onHangup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        {/* Remote video - video của người nhận */}
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Call status */}
          <div className="absolute top-3 sm:top-6 left-1/2 transform -translate-x-1/2 px-3 sm:px-6 py-2 sm:py-3 bg-black/60 text-white rounded-full backdrop-blur-sm">
            <div className="text-center">
              <div className="font-semibold text-sm sm:text-lg">
                {recipientName || "Đang gọi..."}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {callStatus}
              </div>
            </div>
          </div>
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
    </div>
  );
}
