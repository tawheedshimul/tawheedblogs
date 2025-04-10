"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import Button from "../components/common/Button"
import InputField from "../components/forms/InputField"
import LoadingSpinner from "../components/common/LoadingSpinner"

const Profile = () => {
  const { user, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    website: "",
    avatar: null,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: null,
      })
      setAvatarPreview(user.avatar || "")
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Please select an image file" }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Image size should be less than 5MB" }))
      return
    }

    setFormData((prev) => ({ ...prev, avatar: file }))
    setAvatarPreview(URL.createObjectURL(file))

    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: "" }))
    }
  }

  const validateProfileForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = "Please enter a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    if (!validateProfileForm()) return

    setLoading(true)

    try {
      // Create FormData object for file upload
      const profileData = new FormData()
      profileData.append("username", formData.username)
      profileData.append("bio", formData.bio)
      profileData.append("location", formData.location)
      profileData.append("website", formData.website)

      if (formData.avatar) {
        profileData.append("avatar", formData.avatar)
      }

      const response = await api.patch("/api/users/profile", profileData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Update user in context
      updateUserProfile(response.data.user)
      toast.success("Profile updated successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update profile"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setLoading(true)

    try {
      await api.patch("/api/users/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Password updated successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update password"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="text-center">
                    <div className="mb-4">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-4xl font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Change Avatar
                        <input
                          id="avatar-upload"
                          name="avatar"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                      {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <InputField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border-gray-300"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>

                  <InputField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />

                  <InputField
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    error={errors.website}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={loading} disabled={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md mx-auto">
              <InputField
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                required
              />

              <InputField
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                required
              />

              <InputField
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                required
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={loading} disabled={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile;
