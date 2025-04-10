"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"
import FeaturedPosts from "../components/posts/FeaturedPosts"
import PostGrid from "../components/posts/PostGrid"
import Pagination from "../components/common/Pagination"
import LoadingSpinner from "../components/common/LoadingSpinner"
import LatestPostsCarousel from "../components/posts/LatestPostsCarousel"

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTag, setActiveTag] = useState("")
  const [tags, setTags] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const params = { page, limit: 9 }
        if (activeTag) params.tag = activeTag

        const response = await api.get("/api/posts", { params })
        setPosts(response.data.posts)
        setTotalPages(response.data.pages)

        // Extract unique tags from all posts for the tag filter
        if (!activeTag && page === 1) {
          const allTags = response.data.posts
            .flatMap((post) => post.tags)
            .filter((tag, index, self) => tag && self.indexOf(tag) === index)
          setTags(allTags)
        }
      } catch (err) {
        console.error("Error fetching posts:", err)
        setError("Failed to load posts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [page, activeTag])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  const handleTagClick = (tag) => {
    setActiveTag(tag === activeTag ? "" : tag)
    setPage(1)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest insights, tutorials, and stories from our community.
          </p>
        </div>

        {/* Latest Posts Carousel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <LatestPostsCarousel />
        </div>

        <FeaturedPosts />
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Articles</h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTagClick("")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTag === "" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>

            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTag === tag ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <PostGrid posts={posts} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </section>
    </div>
  )
}

export default Home
