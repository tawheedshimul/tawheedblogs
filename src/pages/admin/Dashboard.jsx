"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiUsers, FiFileText, FiMessageSquare, FiActivity } from "react-icons/fi"
import api from "../../utils/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    featuredPosts: 0,
    totalComments: 0,
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch posts for stats calculation
        const postsResponse = await api.get("/posts?limit=5")
        setRecentPosts(postsResponse.data.posts)

        // Fetch users
        const usersResponse = await api.get("/admin/users?limit=1")

        // Calculate stats
        const totalUsers = usersResponse.data.total
        const totalPosts = postsResponse.data.total
        const featuredPosts = postsResponse.data.posts.filter((post) => post.featured).length
        const totalComments = postsResponse.data.posts.reduce((acc, post) => acc + post.comments.length, 0)

        setStats({
          totalUsers,
          totalPosts,
          featuredPosts,
          totalComments,
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FiFileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Featured Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featuredPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Users</h3>
              <p className="text-gray-600 dark:text-gray-400">View and manage user accounts</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FiFileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Posts</h3>
              <p className="text-gray-600 dark:text-gray-400">View, edit, and delete posts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Posts</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentPosts.map((post) => (
            <div key={post._id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/posts/${post._id}`}
                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/edit-post/${post._id}`}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/posts/${post._id}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <Link to="/admin/posts" className="text-primary-600 dark:text-primary-400 hover:underline">
            View all posts →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
