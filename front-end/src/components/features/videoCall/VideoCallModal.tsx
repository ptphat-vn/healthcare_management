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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full h-full">
        {/* Remote video - video của người nhận */}
        <div className="relative w-full h-full bg-gray-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Call status */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/60 text-white rounded-full backdrop-blur-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">
                {recipientName || "Đang gọi..."}
              </div>
              <div className="text-sm text-gray-300">{callStatus}</div>
            </div>
          </div>
        </div>

        {/* Local video - video của bạn (picture-in-picture) */}
        <div className="absolute bottom-24 right-6 w-56 h-40 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 text-sm text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
            Bạn
          </div>
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleHangup}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-110 transition-all duration-200 flex items-center gap-3"
          >
            <PhoneOff className="w-6 h-6" />
            Kết thúc cuộc gọi
          </button>
        </div>
      </div>
    </div>
  );
}
