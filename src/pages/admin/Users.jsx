"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowLeft, FiSearch, FiEdit, FiCheck, FiX } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../../utils/api"
import { formatDate } from "../../utils/formatDate"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/users?page=${currentPage}&limit=10`)
        setUsers(response.data.users)
        setTotalPages(response.data.pages)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real app, you would implement server-side search
    // For now, we'll just filter the current users
    setSearchQuery(e.target.search.value)
  }

  const startEditing = (user) => {
    setEditingUser(user._id)
    setSelectedRole(user.role)
  }

  const cancelEditing = () => {
    setEditingUser(null)
    setSelectedRole("")
  }

  const updateUserRole = async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role: selectedRole })

      // Update the user in the list
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: response.data.role } : user)))

      toast.success("User role updated successfully")
      setEditingUser(null)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error(error.response?.data?.error || "Failed to update user role")
    }
  }

  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link
          to="/admin"
          className="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="search"
                placeholder="Search users..."
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Joined
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
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user._id ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                              : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateUserRole(user._id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(user)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          disabled={user.email === "tawheedshimul@gmail.com"}
                          title={user.email === "tawheedshimul@gmail.com" ? "Cannot edit main admin" : "Edit role"}
                        >
                          <FiEdit size={18} />
                        </button>
                      )}
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

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === index + 1
                      ? "bg-primary-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

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
    </div>
  )
}

export default AdminUsers
