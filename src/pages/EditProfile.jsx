"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FiUser, FiMail, FiMapPin, FiGlobe, FiFileText, FiUpload, FiX } from "react-icons/fi"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const EditProfile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  })

  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar(null)
    setAvatarPreview(user?.avatar || "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const formDataToSend = new FormData()
      formDataToSend.append("username", formData.username)
      formDataToSend.append("bio", formData.bio)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("website", formData.website)

      if (avatar) {
        formDataToSend.append("avatar", avatar)
      }

      const response = await api.patch("/users/profile", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      updateUser(response.data.user)
      toast.success("Profile updated successfully")
      navigate(`/profile/${user.id}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error.response?.data?.error || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.username}&background=random&size=200`}
                alt={user?.username}
                className="w-32 h-32 rounded-full object-cover"
              />

              {avatarPreview && avatarPreview !== user?.avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
              >
                <FiUpload size={16} />
              </button>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Click the upload icon to change your profile picture
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                <FiFileText className="text-gray-400" />
              </div>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about yourself"
              ></textarea>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiGlobe className="text-gray-400" />
              </div>
              <input
                id="website"
                name="website"
                type="text"
                value={formData.website}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/profile/${user.id}`)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
