import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Comment {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
  isDeleted: boolean;
}

interface CommentItemProps {
  comment: Comment;
  isLoading: boolean;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onCancelEdit: () => void;
  editingCommentId: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

export default function CommentItem({
  comment,
  isLoading,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  editingCommentId,
}: CommentItemProps) {
  const [editContent, setEditContent] = useState(comment.content);

  const isEditing = editingCommentId === comment._id;

  const handleUpdate = () => {
    onUpdate(comment._id, editContent);
  };

  const handleEdit = () => {
    setEditContent(comment.content);
    onEdit(comment._id, comment.content);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-gray-900 wrap-break-word">
            {comment.createdBy}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {comment.modifiedBy && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
              Edited
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="h-8 w-8 p-0 shrink-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(comment._id)}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            rows={3}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading || !editContent.trim()}
            >
              Update
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
      )}
    </div>
  );
}
