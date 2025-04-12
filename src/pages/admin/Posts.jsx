"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowLeft, FiSearch, FiEdit, FiTrash, FiStar } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../../utils/api"
import { formatDate } from "../../utils/formatDate"

const AdminPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/posts?page=${currentPage}&limit=10`)
        setPosts(response.data.posts)
        setTotalPages(response.data.pages)
      } catch (error) {
        console.error("Error fetching posts:", error)
        toast.error("Failed to load posts")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(e.target.search.value)
    // In a real app, you would implement server-side search
  }

  const toggleFeatured = async (post) => {
    try {
      const formData = new FormData()
      formData.append("title", post.title)
      formData.append("content", post.content)
      formData.append("featured", !post.featured)

      if (post.tags && post.tags.length > 0) {
        formData.append("tags", post.tags.join(","))
      }

      const response = await api.patch(`/posts/${post._id}`, formData)

      // Update the post in the list
      setPosts(posts.map((p) => (p._id === post._id ? response.data : p)))

      toast.success(`Post ${response.data.featured ? "featured" : "unfeatured"} successfully`)
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    }
  }

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/posts/${postId}`)

      // Remove the post from the list
      setPosts(posts.filter((post) => post._id !== postId))

      toast.success("Post deleted successfully")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    }
  }

  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : posts

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link
          to="/admin"
          className="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Posts</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="search"
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
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.image && (
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            post.author.avatar ||
                            `https://ui-avatars.com/api/?name=${post.author.username}&background=random`
                          }
                          alt={post.author.username}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400">{post.author.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.featured
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {post.featured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleFeatured(post)}
                          className={`${
                            post.featured
                              ? "text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
                              : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                          }`}
                          title={post.featured ? "Unfeature post" : "Feature post"}
                        >
                          <FiStar size={18} className={post.featured ? "fill-current" : ""} />
                        </button>
                        <Link
                          to={`/edit-post/${post._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Edit post"
                        >
                          <FiEdit size={18} />
                        </Link>
                        <button
                          onClick={() => deletePost(post._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete post"
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
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
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Link
          to="/create-post"
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Create New Post
        </Link>
      </div>
    </div>
  )
}

export default AdminPosts
