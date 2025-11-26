/* eslint-disable @typescript-eslint/no-explicit-any */
import { Video } from "lucide-react";
import { useRef, useState } from "react";
import { useStringee } from "@/contexts/StringeeContext";
import VideoCallModal from "../VideoCallModal/VideoCallModal";

// @ts-expect-error - Stringee SDK không có types
import { StringeeCall2 } from "stringee";

interface VideoCallButtonProps {
  currentUserId: string; // userId của bạn (MongoDB ObjectId)
  friendId: string; // userId của bạn bè (MongoDB ObjectId)
  friendName?: string; // Tên của bạn bè (optional)
}

export default function VideoCallButton({
  currentUserId,
  friendId,
  friendName,
}: VideoCallButtonProps) {
  const { client, isConnected } = useStringee();
  const callRef = useRef<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // Hàm gọi video
  const handleVideoCall = () => {
    if (!client || !currentUserId || !friendId || !isConnected) {
      return;
    }

    const call = new StringeeCall2(
      client,
      currentUserId,
      friendId,
      true // gọi video
    );

    callRef.current = call;

    call.makeCall((res: any) => {
      console.log("Make call result:", res);
      if (res.r === 0) {
        setShowCallModal(true);
      }
    });
  };

  const handleHangup = () => {
    setShowCallModal(false);
    callRef.current = null;
  };

  return (
    <>
      <button
        type="button"
        title={!isConnected ? "Đang kết nối..." : "Gọi video"}
        onClick={handleVideoCall}
        disabled={!isConnected}
        className="group relative p-2 rounded-full hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Video
          className={`w-6 h-6 transition-colors duration-200 ${
            isConnected
              ? "text-blue-600 group-hover:text-blue-700"
              : "text-gray-400"
          }`}
        />
      </button>

      {showCallModal && callRef.current && (
        <VideoCallModal
          call={callRef.current}
          onHangup={handleHangup}
          recipientName={friendName}
        />
      )}
    </>
  );
}
