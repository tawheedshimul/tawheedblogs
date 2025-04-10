"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import LoadingSpinner from "../common/LoadingSpinner"
import { ChevronLeftIcon, ChevronRightIcon } from "../icons"

const FeaturedPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/posts/featured", { params: { limit: 5 } })
        setPosts(response.data)
      } catch (err) {
        console.error("Error fetching featured posts:", err)
        setError("Failed to load featured posts")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  useEffect(() => {
    if (posts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [posts.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length)
  }

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length)
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10"></div>

        <div
          className="relative h-96 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="flex h-full">
            {posts.map((post, index) => (
              <div key={post._id} className="min-w-full h-full relative">
                <img
                  src={post.image || "/placeholder.svg?height=600&width=1200"}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end z-20">
                  <div className="p-6 md:p-8 w-full">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          to={`/?tag=${tag}`}
                          className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    <Link to={`/posts/${post._id}`}>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{post.title}</h2>
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
                          <p className="text-xs text-gray-300">{new Date(post.createdAt).toLocaleDateString()}</p>
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
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedPosts;
