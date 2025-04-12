"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import NotificationDropdown from "./NotificationDropdown"
import MessageNotificationDropdown from "./MessageNotificationDropdown"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiSearch,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiBell,
  FiPlusCircle,
} from "react-icons/fi"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMessageNotificationOpen, setIsMessageNotificationOpen] = useState(false)
  const userMenuRef = useRef(null)
  const notificationRef = useRef(null)
  const messageNotificationRef = useRef(null)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMenuOpen(false)
    }
  }

  const handleClickOutside = useCallback((event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setIsUserMenuOpen(false)
    }
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setIsNotificationOpen(false)
    }
    if (messageNotificationRef.current && !messageNotificationRef.current.contains(event.target)) {
      setIsMessageNotificationOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen)
    setIsMessageNotificationOpen(false)
  }

  const toggleMessageNotifications = () => {
    setIsMessageNotificationOpen(!isMessageNotificationOpen)
    setIsNotificationOpen(false)
  }

  const handleProfileClick = () => {
    if (user && user.id) {
      navigate(`/profile/${user.id}`)
      setIsUserMenuOpen(false)
    } else {
      // If user ID is not available, show a message
      toast.error("Unable to access profile. Please try logging in again.")
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">BlogApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1 pl-3 pr-10 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                <FiSearch />
              </button>
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create-post"
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                  aria-label="Create Post"
                >
                  <FiPlusCircle size={20} />
                </Link>

                <div className="relative" ref={messageNotificationRef}>
                  <button
                    onClick={toggleMessageNotifications}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative"
                    aria-label="Messages"
                  >
                    <FiMessageSquare />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                      2
                    </span>
                  </button>
                  {isMessageNotificationOpen && (
                    <MessageNotificationDropdown onClose={() => setIsMessageNotificationOpen(false)} />
                  )}
                </div>

                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative"
                    aria-label="Notifications"
                  >
                    <FiBell />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      3
                    </span>
                  </button>
                  {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                      width="32"
                      height="32"
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      {user.id && (
                        <Link
                          to={`/profile/${user.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiUser className="inline mr-2" /> Profile
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-3 pr-10 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                <FiSearch />
              </button>
            </form>

            {user ? (
              <>
                {user.id && (
                  <Link
                    to={`/profile/${user.id}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <Link
                  to="/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/create-post"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Post
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => {
                toggleTheme()
                setIsMenuOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <>
                  <FiSun className="mr-2 text-yellow-400" /> Light Mode
                </>
              ) : (
                <>
                  <FiMoon className="mr-2" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar;
