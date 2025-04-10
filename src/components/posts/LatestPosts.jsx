"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import LoadingSpinner from "../common/LoadingSpinner"

const LatestPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/posts/latest")
        setPosts(response.data)
      } catch (err) {
        console.error("Error fetching latest posts:", err)
        setError("Failed to load latest posts")
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPosts()
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.image && (
            <Link to={`/posts/${post._id}`} className="block h-40 w-full overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>
          )}

          <div className="p-4">
            <Link to={`/posts/${post._id}`}>
              <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
            </Link>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt || post.content.substring(0, 100)}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden mr-2">
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar || "/placeholder.svg"}
                      alt={post.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xs font-bold">
                      {post.author?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>

              <Link to={`/posts/${post._id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                Read more
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LatestPosts
