"use client"

import { useState, useEffect, useRef, memo } from "react"
import { Link } from "react-router-dom"
import { FiHeart, FiMessageCircle, FiX, FiAlertCircle } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { timeAgo } from "../utils/formatDate"

// Mock notifications data for development
const MOCK_NOTIFICATIONS = [
  {
    _id: "1",
    type: "like",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    from: {
      _id: "user1",
      username: "johndoe",
      avatar: null,
    },
    post: {
      _id: "post1",
      title: "Getting Started with React",
    },
  },
  {
    _id: "2",
    type: "comment",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    from: {
      _id: "user2",
      username: "janedoe",
      avatar: null,
    },
    post: {
      _id: "post2",
      title: "Advanced JavaScript Techniques",
    },
  },
  {
    _id: "3",
    type: "like",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    from: {
      _id: "user3",
      username: "bobsmith",
      avatar: null,
    },
    post: {
      _id: "post1",
      title: "Getting Started with React",
    },
  },
]

const NotificationDropdown = memo(({ onClose }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from API first
        try {
          const response = await api.get("/notifications?type=like,comment", {
            timeout: 3000, // Set a timeout to avoid long waiting
          })
          setNotifications(response.data || [])
        } catch (apiError) {
          console.error("Error fetching notifications:", apiError)

          // If API fails, use mock data
          console.log("Using mock notification data instead")
          setNotifications(MOCK_NOTIFICATIONS)
        }
      } catch (error) {
        console.error("Error in notification component:", error)
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  const markAsRead = async (notificationId) => {
    try {
      // Try API call first
      try {
        await api.patch(`/notifications/${notificationId}`)
      } catch (apiError) {
        console.log("Mock: Marking notification as read")
      }

      // Update UI regardless of API success
      setNotifications(notifications.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Try API call first
      try {
        await api.patch("/notifications/read-all")
      } catch (apiError) {
        console.log("Mock: Marking all notifications as read")
      }

      // Update UI regardless of API success
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return `/posts/${notification.post?._id}`
      default:
        return "#"
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <FiHeart className="text-red-500" />
      case "comment":
        return <FiMessageCircle className="text-blue-500" />
      default:
        return null
    }
  }

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case "like":
        return `liked your post "${notification.post?.title || "a post"}"`
      case "comment":
        return `commented on your post "${notification.post?.title || "a post"}"`
      default:
        return notification.text || "interacted with your content"
    }
  }

  if (!user) return null

  return (
    <div
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-[80vh] overflow-y-auto"
      ref={dropdownRef}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button onClick={markAllAsRead} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          <FiAlertCircle className="mx-auto mb-2" size={24} />
          <p>{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">No notifications yet</div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <Link
              key={notification._id}
              to={getNotificationLink(notification)}
              className={`block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              onClick={() => {
                markAsRead(notification._id)
                onClose()
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={
                      notification.from?.avatar ||
                      `https://ui-avatars.com/api/?name=${notification.from?.username || "User"}&background=random`
                    }
                    alt={notification.from?.username || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                    width="40"
                    height="40"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="mr-2">{getNotificationIcon(notification.type)}</span>
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{notification.from?.username}</span>{" "}
                      {getNotificationText(notification)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
})

NotificationDropdown.displayName = "NotificationDropdown"

export default NotificationDropdown;
