"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import Button from "../components/common/Button"
import { PencilIcon, TrashIcon, PlusIcon } from "../components/icons"

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [totalPosts, setTotalPosts] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)

        // If admin, fetch all posts, otherwise fetch only user's posts
        const params = isAdmin ? { page, limit: 20 } : { author: user.id, page, limit: 20 }

        const response = await api.get("/api/posts", { params })

        setPosts(response.data.posts)
        setTotalPosts(response.data.total)
        setTotalPages(response.data.pages)
      } catch (err) {
        console.error("Error fetching posts:", err)
        setError("Failed to load posts")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPosts()
    }
  }, [user, isAdmin, page])

  const handleDelete = async (id) => {
    if (deleteId === id) {
      try {
        await api.delete(`/api/posts/${id}`)
        setPosts(posts.filter((post) => post._id !== id))
        toast.success("Post deleted successfully")
      } catch (err) {
        toast.error("Failed to delete post")
      } finally {
        setDeleteId(null)
      }
    } else {
      setDeleteId(id)
      setTimeout(() => setDeleteId(null), 3000)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  // Check if user can edit/delete a post (own post or admin)
  const canManagePost = (post) => {
    return isAdmin || post.author._id === user.id
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isAdmin ? "All Posts Dashboard" : "Your Dashboard"}</h1>
        <Link to="/create-post">
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isAdmin ? `All Posts (${totalPosts})` : `Your Posts (${posts.length})`}
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {isAdmin ? "No posts have been created yet" : "You haven't created any posts yet"}
              </p>
              <Link to="/create-post">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/posts/${post._id}`} className="text-blue-600 hover:underline font-medium">
                          {post.title}
                        </Link>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                            {post.author.username}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.featured ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {post.featured ? "Featured" : "Published"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.likes?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.comments?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {canManagePost(post) && (
                            <>
                              <Link to={`/edit-post/${post._id}`} className="text-indigo-600 hover:text-indigo-900">
                                <PencilIcon className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(post._id)}
                                className={`${deleteId === post._id ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {!canManagePost(post) && <span className="text-gray-400 text-sm italic">No permission</span>}
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
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      pageNum === page ? "bg-blue-50 text-blue-600 z-10" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
