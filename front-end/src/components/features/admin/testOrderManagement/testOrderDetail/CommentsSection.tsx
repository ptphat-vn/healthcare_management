import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  useCreateCommentTestOrderMutation,
  useUpdateCommentTestOrderMutation,
  useDeleteCommentTestOrderMutation,
} from "@/services/commentTestOrderApi";
import { toast } from "sonner";
import DeleteCommentDialog from "./comments/DeleteCommentDialog";
import CommentItem from "./comments/CommentItem";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

interface Comment {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
  isDeleted: boolean;
  aiReviewedBy?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  testOrderId: string;
}

export default function CommentsSection({
  comments,
  testOrderId,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const role = user?.data?.roleCode;
  const [createComment, { isLoading: isCreating }] =
    useCreateCommentTestOrderMutation();
  const [updateComment, { isLoading: isUpdating }] =
    useUpdateCommentTestOrderMutation();
  const [deleteComment, { isLoading: isDeleting }] =
    useDeleteCommentTestOrderMutation();

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const result = await createComment({
        id: testOrderId,
        content: newComment,
      }).unwrap();

      toast.success(result.message || "Comment added successfully!");
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to add comment");
    }
  };

  const handleEditClick = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    console.log(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!content.trim()) {
      toast.error("Please enter comment content");
      return;
    }

    try {
      const result = await updateComment({
        id: testOrderId,
        commentId,
        content,
      }).unwrap();

      toast.success(result.message || "Comment updated successfully!");
      setEditingCommentId(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      const result = await deleteComment({
        id: testOrderId,
        commentId: commentToDelete,
      }).unwrap();

      toast.success(result.message || "Comment deleted successfully!");
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to delete comment");
    }
  };

  const isLoading = isCreating || isUpdating || isDeleting;
  const visibleComments = comments.filter((c) => !c.isDeleted);

  const aiDiagnosisPrefix = /^\[AI Diagnosis\]\s*/i;
  const getCommentMeta = (comment: Comment) => {
    const isAiDiagnosis = aiDiagnosisPrefix.test(comment.content.trim());
    const displayAuthor = isAiDiagnosis
      ? comment.aiReviewedBy || comment.createdBy
      : comment.createdBy;
    const displayContent = isAiDiagnosis
      ? comment.content.replace(aiDiagnosisPrefix, "").trim()
      : comment.content;

    return { isAiDiagnosis, displayAuthor, displayContent };
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-linear-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <MessageSquare className="w-6 h-6" />
            Comments ({visibleComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Add Comment */}
          <div className="mb-6 pb-6 border-b">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setNewComment("")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={isLoading || !newComment.trim()}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${getRoleButtonClass(
                  role
                )} `}
              >
                {isCreating ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {visibleComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleComments.map((comment) => {
                const { isAiDiagnosis, displayAuthor, displayContent } =
                  getCommentMeta(comment);

                return (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    isLoading={isLoading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onUpdate={handleUpdateComment}
                    onCancelEdit={handleCancelEdit}
                    editingCommentId={editingCommentId}
                    isAiDiagnosis={isAiDiagnosis}
                    displayAuthor={displayAuthor}
                    displayContent={displayContent}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteCommentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
