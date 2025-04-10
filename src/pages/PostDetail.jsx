"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import Button from "../components/common/Button"
import CommentForm from "../components/comments/CommentForm"
import CommentList from "../components/comments/CommentList"
import { HeartIcon, ShareIcon, BookmarkIcon } from "../components/icons"

const PostDetail = () => {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/posts/${id}`)
        setPost(response.data)

        // Check if user has liked the post
        if (user) {
          const liked = response.data.likes.some((like) => like._id === user.id)
          setIsLiked(liked)
        }

        setLikeCount(response.data.likes.length)
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post. It may have been removed or you may not have permission to view it.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, user])

  const handleLike = async () => {
    if (!user) {
      toast.info("Please log in to like posts")
      return navigate("/login")
    }

    if (isLiking) return

    try {
      setIsLiking(true)
      await api.post(`/api/posts/${id}/like`)
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    } catch (err) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await api.delete(`/api/posts/${id}`)
        toast.success("Post deleted successfully")
        navigate("/")
      } catch (err) {
        toast.error("Failed to delete post")
      }
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  // Check if user can edit/delete the post (own post or admin)
  const canEdit = user && post && (user.id === post.author._id || isAdmin)

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
        <div className="text-center mt-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Return to home page
          </Link>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image && (
          <div className="relative h-96 w-full">
            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${tag}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200"
              >
                {tag}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-4">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-lg font-bold">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{post.author.username}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
                {post.createdAt !== post.updatedAt && " (Updated)"}
              </p>
            </div>
          </div>

          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 my-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center space-x-1 group transition-colors focus:outline-none"
              >
                <HeartIcon
                  className={`w-6 h-6 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-500 group-hover:text-red-500"}`}
                />
                <span className="text-sm">{likeCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ShareIcon className="w-6 h-6" />
                <span className="text-sm">Share</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                <BookmarkIcon className="w-6 h-6" />
                <span className="text-sm">Save</span>
              </button>
            </div>

            {canEdit && (
              <div className="flex space-x-2">
                <Link to={`/edit-post/${post._id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  {confirmDelete ? "Confirm Delete" : "Delete"}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Comments ({post.comments.length})</h3>
            {user ? (
              <CommentForm
                postId={post._id}
                onCommentAdded={(comment) => {
                  setPost({
                    ...post,
                    comments: [...post.comments, comment],
                  })
                }}
              />
            ) : (
              <p className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{" "}
                to leave a comment
              </p>
            )}

            <CommentList
              comments={post.comments}
              postId={post._id}
              onCommentDeleted={(commentId) => {
                setPost({
                  ...post,
                  comments: post.comments.filter((c) => c._id !== commentId),
                })
              }}
            />
          </div>
        </div>
      </article>
    </div>
  )
}

export default PostDetail
