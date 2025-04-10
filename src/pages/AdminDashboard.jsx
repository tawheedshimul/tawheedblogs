"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import api from "../utils/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import Button from "../components/common/Button"
import { UserIcon, PostIcon, SettingsIcon } from "../components/icons"

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [usersResponse, postsResponse] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/posts", { params: { limit: 100 } }),
        ])

        setUsers(usersResponse.data.users)
        setPosts(postsResponse.data.posts)
      } catch (err) {
        console.error("Error fetching admin data:", err)
        setError("Failed to load admin data. You may not have sufficient permissions.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Confirm before making someone an admin
      if (
        newRole === "admin" &&
        !window.confirm(
          "Are you sure you want to make this user an admin? This will give them full access to the admin dashboard.",
        )
      ) {
        return
      }

      const response = await api.patch(`/api/admin/users/${userId}/role`, { role: newRole })

      setUsers(users.map((user) => (user._id === userId ? { ...user, role: response.data.role } : user)))

      toast.success(`User role updated to ${newRole}`)
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update user role"
      toast.error(message)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
        return
      }

      await api.delete(`/api/posts/${postId}`)
      setPosts(posts.filter((post) => post._id !== postId))
      toast.success("Post deleted successfully")
    } catch (err) {
      toast.error("Failed to delete post")
    }
  }

  const handleFeaturePost = async (postId, featured) => {
    try {
      await api.patch(`/api/posts/${postId}`, { featured: !featured })

      setPosts(posts.map((post) => (post._id === postId ? { ...post, featured: !featured } : post)))

      toast.success(featured ? "Post unfeatured" : "Post featured")
    } catch (err) {
      toast.error("Failed to update post")
    }
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserIcon className="w-5 h-5 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "posts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <PostIcon className="w-5 h-5 inline mr-2" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <SettingsIcon className="w-5 h-5 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.username}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-lg font-medium text-gray-500">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.email === "tawheedshimul5@gmail.com" ? (
                            <div className="text-sm text-gray-500">Main Admin (Cannot Change)</div>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Post Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
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
                          <a
                            href={`/posts/${post._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {post.title}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.featured ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {post.featured ? "Featured" : "Regular"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={post.featured ? "outline" : "default"}
                              onClick={() => handleFeaturePost(post._id, post.featured)}
                            >
                              {post.featured ? "Unfeature" : "Feature"}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeletePost(post._id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
              <p className="text-gray-500 mb-4">Site settings functionality coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
