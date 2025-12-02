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
        <div
          className="
            absolute bottom-full left-0 md:right-0 md:left-auto mb-1 z-50
            w-[240px] sm:w-[260px] md:w-[320px]
            max-w-[calc(100vw-2rem)]
          "
        >
          <div className="emoji-picker-container bg-white rounded-lg shadow-lg border">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              skinTonesDisabled={true}
              width="100%"
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
