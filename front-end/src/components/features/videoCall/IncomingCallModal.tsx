/* eslint-disable @typescript-eslint/no-explicit-any */
import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {!isAnswered ? (
          // Màn hình cuộc gọi đến
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <Video className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              📞 Cuộc gọi video đến
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Từ: <span className="font-semibold">{call.fromNumber}</span>
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleAccept}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Trả lời
              </button>
              <button
                onClick={handleReject}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <PhoneOff className="w-6 h-6" />
                Từ chối
              </button>
            </div>
          </div>
        ) : (
          // Màn hình đang gọi
          <div className="relative">
            {/* Remote video - video của người gọi */}
            <div className="relative w-full h-[70vh] bg-gray-900">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {callStatus && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 text-white rounded-lg backdrop-blur-sm">
                  {callStatus}
                </div>
              )}
            </div>

            {/* Local video - video của bạn (picture-in-picture) */}
            <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                Bạn
              </div>
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={handleHangup}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                Kết thúc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
