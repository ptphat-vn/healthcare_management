import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface CommentsSectionProps {
  comments: Comment[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

export default function CommentsSection({ comments }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsSubmitting(true);
      // TODO: Call API to add comment
      console.log("Add comment:", newComment);
      setTimeout(() => {
        setNewComment("");
        setIsSubmitting(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <MessageSquare className="w-6 h-6" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Add Comment */}
          <div className="mb-6 pb-6 border-b">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setNewComment("")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddComment} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments
                .filter((c) => !c.isDeleted)
                .map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {comment.createdBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {comment.modifiedBy && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
                          Edited
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
