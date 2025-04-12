

import { useState, memo } from "react"
import { Link } from "react-router-dom"
import { FiHeart, FiMessageSquare, FiClock } from "react-icons/fi"
import { timeAgo } from "../utils/formatDate"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import toast from "react-hot-toast"

const PostCard = memo(({ post: initialPost }) => {
  const { user } = useAuth()
  const [post, setPost] = useState(initialPost)
  const [liking, setLiking] = useState(false)

  const hasLiked = user && post.likes?.some((like) => like._id === user.id)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error("Please login to like posts")
      return
    }

    try {
      setLiking(true)
      const response = await api.post(`/posts/${post._id}/like`)
      setPost(response.data)
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    } finally {
      setLiking(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      {post.image && (
        <Link to={`/posts/${post._id}`}>
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-5">
        <div className="flex items-center mb-3">
          <Link to={`/profile/${post.author._id}`} className="flex items-center">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="w-8 h-8 rounded-full mr-2 object-cover"
              loading="lazy"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author.username}</span>
          </Link>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <FiClock className="mr-1" size={14} />
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <Link to={`/posts/${post._id}`}>
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center ${
                hasLiked
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              }`}
            >
              <FiHeart className={`mr-1 ${hasLiked ? "fill-current" : ""}`} />
              {post.likes?.length || 0}
            </button>
            <Link to={`/posts/${post._id}#comments`} className="flex items-center text-gray-500 dark:text-gray-400">
              <FiMessageSquare className="mr-1" />
              {post.comments?.length || 0}
            </Link>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag, index) => (
                <Link
                  key={index}
                  to={`/search?tag=${tag}`}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  #{tag}
                </Link>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PostCard.displayName = "PostCard"

export default PostCard;