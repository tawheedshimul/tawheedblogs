"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FiEdit, FiMapPin, FiGlobe, FiCalendar, FiMail, FiMessageSquare, FiAlertCircle } from "react-icons/fi"
import toast from "react-hot-toast"
import PostCard from "../components/PostCard"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { formatDate } from "../utils/formatDate"

// Mock profile data for development
const MOCK_PROFILE = {
  _id: "mock-user-id",
  username: "demouser",
  email: "demo@example.com",
  bio: "This is a demo profile that appears when the real profile can't be loaded.",
  location: "Internet",
  website: "https://example.com",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
  avatar: null,
}

// Mock posts for development
const MOCK_POSTS = [
  {
    _id: "mock-post-1",
    title: "Getting Started with React",
    content: "This is a sample post about React.",
    excerpt: "Learn the basics of React and how to create your first component...",
    author: {
      _id: "mock-user-id",
      username: "demouser",
      avatar: null,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    likes: [],
    comments: [],
    tags: ["react", "javascript", "frontend"],
  },
  {
    _id: "mock-post-2",
    title: "Advanced CSS Techniques",
    content: "This is a sample post about CSS.",
    excerpt: "Discover advanced CSS techniques to make your websites stand out...",
    author: {
      _id: "mock-user-id",
      username: "demouser",
      avatar: null,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    likes: [],
    comments: [],
    tags: ["css", "design", "frontend"],
  },
]

const Profile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)

  const fetchProfile = useCallback(async () => {
    // Check if id is valid
    if (!id || id === "undefined") {
      console.error("Invalid profile ID:", id)
      setError("Invalid profile ID. Please check the URL and try again.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUseMockData(false)

      // Use a specific cache configuration for profile data
      const response = await api.get(`/users/${id}`, {
        cache: true, // Enable caching
        timeout: 5000, // 5 second timeout
      })

      setProfile(response.data.user)
      setPosts(response.data.posts)
    } catch (error) {
      console.error("Error fetching profile:", error)

      // If we're in development mode or the error is severe, use mock data
      if (import.meta.env.DEV || error.message.includes("Network Error") || error.response?.status === 404) {
        console.log("Using mock profile data")
        setUseMockData(true)
        setProfile(MOCK_PROFILE)
        setPosts(MOCK_POSTS)
      } else {
        setError(error.response?.data?.error || "Failed to load profile")
        toast.error("Failed to load profile")
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // Reset state when id changes
    setProfile(null)
    setPosts([])
    setError(null)
    setLoading(true)

    // Only fetch if we have a valid ID
    if (id && id !== "undefined") {
      fetchProfile()
    } else {
      // Use mock data if no valid ID
      console.log("No valid ID provided, using mock data")
      setUseMockData(true)
      setProfile(MOCK_PROFILE)
      setPosts(MOCK_POSTS)
      setLoading(false)
    }

    // Clear cache for this profile when component unmounts
    return () => {
      if (id && id !== "undefined") {
        api.clearCacheFor(`/users/${id}`)
      }
    }
  }, [id, fetchProfile])

  const handleSendMessage = () => {
    if (profile && user && profile._id !== user.id) {
      navigate(`/messages/${profile._id}`)
    }
  }

  const handleRetry = () => {
    fetchProfile()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !useMockData) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Profile</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <button onClick={handleRetry} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Try Again
          </button>
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!profile && !useMockData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Back to Home
        </Link>
      </div>
    )
  }

  const isCurrentUser = user && user.id === profile._id

  return (
    <div className="max-w-4xl mx-auto">
      {useMockData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Showing demo profile data. The actual profile could not be loaded.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=random&size=200`}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover"
              loading="eager"
              width="128"
              height="128"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>

                <div className="flex mt-2 md:mt-0 gap-2 justify-center md:justify-end">
                  {isCurrentUser ? (
                    <Link
                      to="/edit-profile"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      <FiEdit className="mr-2" /> Edit Profile
                    </Link>
                  ) : (
                    user && (
                      <button
                        onClick={handleSendMessage}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <FiMessageSquare className="mr-2" /> Message
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                {profile.bio && <p>{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 mt-4">
                  {profile.location && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center">
                      <FiGlobe className="mr-2 text-gray-500 dark:text-gray-400" />
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>

                  {isCurrentUser && (
                    <div className="flex items-center">
                      <FiMail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Posts by {profile.username}</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400">
              {isCurrentUser ? "You haven't" : `${profile.username} hasn't`} published any posts yet.
            </p>

            {isCurrentUser && (
              <Link
                to="/create-post"
                className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to={`/search?author=${profile._id}`}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              View All Posts by {profile.username}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile;
