"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { TrashIcon } from "../icons"

const CommentList = ({ comments, postId, onCommentDeleted }) => {
  const { user } = useAuth()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (commentId) => {
    try {
      setDeletingId(commentId)
      await api.delete(`/api/posts/${postId}/comments/${commentId}`)
      onCommentDeleted(commentId)
      toast.success("Comment deleted successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete comment"
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment._id} className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {comment.user?.avatar ? (
                <img
                  src={comment.user.avatar || "/placeholder.svg"}
                  alt={comment.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-lg font-bold">
                  {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
          <div className="flex-grow">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{comment.user?.username || "Unknown"}</h4>
                  <p className="text-xs text-gray-500">{format(new Date(comment.createdAt), "MMM d, yyyy • h:mm a")}</p>
                </div>
                {user && (user.id === comment.user?._id || user.role === "admin") && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    disabled={deletingId === comment._id}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700">{comment.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentList
