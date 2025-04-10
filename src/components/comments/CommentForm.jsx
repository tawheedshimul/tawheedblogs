"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import api from "../../utils/api"
import Button from "../common/Button"

const CommentForm = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!text.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await api.post(`/api/posts/${postId}/comments`, { text })
      setText("")
      onCommentAdded(response.data)
      toast.success("Comment added successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add comment"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <label htmlFor="comment" className="sr-only">
          Your comment
        </label>
        <textarea
          id="comment"
          rows="3"
          className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !text.trim()}>
          Post Comment
        </Button>
      </div>
    </form>
  )
}

export default CommentForm
