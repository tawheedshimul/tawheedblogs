"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Carousel } from "antd"
import api from "../../utils/api"
import LoadingSpinner from "../common/LoadingSpinner"
import { format } from "date-fns"

const LatestPostsCarousel = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/posts/latest", { params: { limit: 4 } })
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

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <Carousel {...carouselSettings}>
        {posts.map((post) => (
          <div key={post._id} className="relative">
            <div className="relative h-[400px] w-full">
              <img
                src={post.image || "/placeholder.svg?height=600&width=1200"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Link
                      key={tag}
                      to={`/?tag=${tag}`}
                      className="px-2 py-1 bg-blue-600/80 text-white text-xs font-medium rounded-full hover:bg-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <Link to={`/posts/${post._id}`}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 hover:text-blue-300 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-200 mb-4 line-clamp-2">{post.excerpt || post.content.substring(0, 150)}</p>
                <div className="flex items-center justify-between">
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
                      <p className="text-sm font-medium text-white">{post.author?.username || "Unknown"}</p>
                      <p className="text-xs text-gray-300">{format(new Date(post.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <Link
                    to={`/posts/${post._id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default LatestPostsCarousel;
