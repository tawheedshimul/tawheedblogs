"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowRight } from "react-icons/fi"
import PostCard from "../components/PostCard"
import api from "../utils/api"

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [latestPosts, setLatestPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const [featuredResponse, latestResponse] = await Promise.all([
          api.get("/posts/featured?limit=3"),
          api.get("/posts/latest?limit=6"),
        ])

        setFeaturedPosts(featuredResponse.data)
        setLatestPosts(latestResponse.data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Welcome to BlogApp</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/search"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Explore Posts
          </Link>
          <Link
            to="/create-post"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Start Writing
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Posts</h2>
            <Link
              to="/search?featured=true"
              className="text-primary-600 dark:text-primary-400 flex items-center hover:underline"
            >
              View all <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Posts</h2>
          <Link to="/search" className="text-primary-600 dark:text-primary-400 flex items-center hover:underline">
            View all <FiArrowRight className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
