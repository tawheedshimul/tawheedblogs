"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { FiSearch, FiFilter, FiX } from "react-icons/fi"
import PostCard from "../components/PostCard"
import api from "../utils/api"

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const query = searchParams.get("q") || ""
  const tag = searchParams.get("tag") || ""
  const author = searchParams.get("author") || ""
  const featured = searchParams.get("featured") || ""

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)

        const params = new URLSearchParams()
        if (query) params.append("search", query)
        if (tag) params.append("tag", tag)
        if (author) params.append("author", author)
        if (featured) params.append("featured", featured)
        params.append("page", currentPage)
        params.append("limit", 9)

        const response = await api.get(`/posts?${params.toString()}`)
        setPosts(response.data.posts)
        setTotalPosts(response.data.total)
        setTotalPages(response.data.pages)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [query, tag, author, featured, currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const searchQuery = formData.get("search")

    const newParams = new URLSearchParams(searchParams)
    if (searchQuery) {
      newParams.set("q", searchQuery)
    } else {
      newParams.delete("q")
    }

    setSearchParams(newParams)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterName, value) => {
    const newParams = new URLSearchParams(searchParams)

    if (value) {
      newParams.set(filterName, value)
    } else {
      newParams.delete(filterName)
    }

    setSearchParams(newParams)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchParams(query ? { q: query } : {})
    setCurrentPage(1)
  }

  const hasActiveFilters = tag || author || featured

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {query
            ? `Search results for "${query}"`
            : tag
              ? `Posts tagged with "${tag}"`
              : featured
                ? "Featured Posts"
                : "Browse All Posts"}
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={query}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <FiFilter className="inline mr-1" /> Filters
          </button>
        </form>

        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                >
                  <FiX className="mr-1" /> Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  id="tag-filter"
                  value={tag}
                  onChange={(e) => handleFilterChange("tag", e.target.value)}
                  placeholder="Filter by tag"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label
                  htmlFor="featured-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Featured
                </label>
                <select
                  id="featured-filter"
                  value={featured}
                  onChange={(e) => handleFilterChange("featured", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Posts</option>
                  <option value="true">Featured Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalPosts} {totalPosts === 1 ? "post" : "posts"} found
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No posts found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNumber
                            ? "bg-primary-600 text-white"
                            : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNumber}>...</span>
                  } else {
                    return null
                  }
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Search
