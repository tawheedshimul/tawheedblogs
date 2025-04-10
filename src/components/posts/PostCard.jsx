"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { HeartIcon, MessageIcon } from "../icons"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"

const PostCard = ({ post }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isLiked, setIsLiked] = useState(user && post.likes?.some((like) => like._id === user.id))
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.info("Please log in to like posts")
      return navigate("/login")
    }

    if (isLiking) return

    try {
      setIsLiking(true)
      await api.post(`/api/posts/${post._id}/like`)
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    } catch (err) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/posts/${post._id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="cursor-pointer" onClick={handleCardClick}>
        {post.image && (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${tag}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            ))}
          </div>

          <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>

          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt || post.content.substring(0, 150)}</p>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
                  {post.author?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{post.author?.username || "Unknown"}</p>
              <p className="text-xs text-gray-500">{format(new Date(post.createdAt), "MMM d, yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 text-gray-500">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center transition-colors hover:text-blue-600 focus:outline-none"
          >
            <HeartIcon className={`w-4 h-4 mr-1 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
          <Link to={`/posts/${post._id}`} className="flex items-center hover:text-blue-600">
            <MessageIcon className="w-4 h-4 mr-1" />
            <span className="text-xs">{post.comments?.length || 0}</span>
          </Link>
        </div>
        <Link to={`/posts/${post._id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          Read more
        </Link>
      </div>
    </div>
  )
}

export default PostCard
