"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FiHeart, FiMessageSquare, FiEdit, FiTrash, FiClock, FiTag, FiAlertCircle } from "react-icons/fi"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { formatDate, timeAgo } from "../utils/formatDate"

// Memoized Comment component to prevent unnecessary re-renders
const Comment = memo(({ comment, user, onDelete }) => {
  return (
    <div className="flex gap-4">
      <Link to={`/profile/${comment.user._id}`}>
        <img
          src={
            comment.user.avatar ||
            `https://ui-avatars.com/api/?name=${comment.user.username || "User"}&background=random`
          }
          alt={comment.user.username}
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
          width="40"
          height="40"
        />
      </Link>
      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link
              to={`/profile/${comment.user._id}`}
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              {comment.user.username}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(comment.createdAt)}</p>
          </div>
          {user && (comment.user._id === user.id || user.role === "admin") && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete comment"
            >
              <FiTrash size={16} />
            </button>
          )}
        </div>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.text}</p>
      </div>
    </div>
  )
})

Comment.displayName = "Comment"

const PostDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/posts/${id}`, {
        cache: true, // Enable caching
      })
      setPost(response.data)
    } catch (error) {
      console.error("Error fetching post:", error)
      setError(error.response?.data?.error || "Failed to load post")
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPost()

    // Clear cache for this post when component unmounts
    return () => {
      api.clearCacheFor(`/posts/${id}`)
    }
  }, [id, fetchPost])

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("Please login to like posts")
      return
    }

    try {
      setLiking(true)
      const response = await api.post(
        `/posts/${id}/like`,
        {},
        {
          cache: false, // Disable caching for this request
        },
      )
      setPost(response.data)
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    } finally {
      setLiking(false)
    }
  }, [id, user])

  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!user) {
        toast.error("Please login to comment")
        return
      }

      if (!comment.trim()) {
        toast.error("Comment cannot be empty")
        return
      }

      try {
        setSubmittingComment(true)
        const response = await api.post(
          `/posts/${id}/comments`,
          { text: comment },
          {
            cache: false, // Disable caching for this request
          },
        )
        setPost({
          ...post,
          comments: [...post.comments, response.data],
        })
        setComment("")
        toast.success("Comment added")
      } catch (error) {
        console.error("Error adding comment:", error)
        toast.error("Failed to add comment")
      } finally {
        setSubmittingComment(false)
      }
    },
    [comment, id, post, user],
  )

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await api.delete(`/posts/${id}/comments/${commentId}`, {
          cache: false, // Disable caching for this request
        })
        setPost({
          ...post,
          comments: post.comments.filter((c) => c._id !== commentId),
        })
        toast.success("Comment deleted")
      } catch (error) {
        console.error("Error deleting comment:", error)
        toast.error("Failed to delete comment")
      }
    },
    [id, post],
  )

  const handleDeletePost = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)
      await api.delete(`/posts/${id}`, {
        cache: false, // Disable caching for this request
      })
      // Clear cache for posts
      api.clearCacheFor("/posts")
      toast.success("Post deleted successfully")
      navigate("/")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
      setDeleting(false)
    }
  }, [id, navigate])

  const handleRetry = () => {
    fetchPost()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Post</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <button onClick={handleRetry} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Try Again
          </button>
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Back to Home
        </Link>
      </div>
    )
  }

  const isAuthor = user && post.author._id === user.id
  const isAdmin = user && user.role === "admin"
  const canEdit = isAuthor || isAdmin
  const hasLiked = user && post.likes.some((like) => like._id === user.id)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post Header */}
      <div className="mb-8">
        {post.image && (
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            loading="eager"
            width="800"
            height="400"
          />
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link to={`/profile/${post.author._id}`} className="flex items-center">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="w-10 h-10 rounded-full mr-3 object-cover"
              loading="eager"
              width="40"
              height="40"
            />
            <span className="font-medium text-gray-900 dark:text-white">{post.author.username}</span>
          </Link>

          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <FiClock className="mr-1" />
            {formatDate(post.createdAt)}
          </span>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/search?tag=${tag}`}
                  className="flex items-center text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiTag className="mr-1" size={14} />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-4 mb-6">
            <Link
              to={`/edit-post/${post._id}`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiEdit className="mr-2" /> Edit
            </Link>
            <button
              onClick={handleDeletePost}
              disabled={deleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash className="mr-2" /> Delete
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={handleLike}
          disabled={liking || !user}
          className={`flex items-center gap-2 ${
            hasLiked
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          }`}
        >
          <FiHeart className={hasLiked ? "fill-current" : ""} />
          <span>{post.likes.length}</span>
        </button>

        <button
          onClick={() => document.getElementById("comment-form").focus()}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <FiMessageSquare />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      <div id="comments">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments ({post.comments.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <div className="flex gap-4">
            {user && (
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
                width="40"
                height="40"
              />
            )}
            <div className="flex-1">
              <textarea
                id="comment-form"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={user ? "Write a comment..." : "Please login to comment"}
                disabled={!user || submittingComment}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                rows="3"
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!user || !comment.trim() || submittingComment}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submittingComment ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {post.comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <Comment key={comment._id} comment={comment} user={user} onDelete={handleDeleteComment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PostDetail;
