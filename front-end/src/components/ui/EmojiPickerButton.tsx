import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

type EmojiClickData = {
  emoji: string;
  unified: string;
  originalUnified?: string;
  names: string[];
  imageUrl: string;
  activeSkinTone?: string;
};

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative" ref={emojiPickerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="flex-shrink-0"
      >
        <Smile className="w-5 h-5 text-gray-600" />
      </Button>
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            skinTonesDisabled={true}
            width={350}
            height={400}
          />
        </div>
      )}
    </div>
  );
}