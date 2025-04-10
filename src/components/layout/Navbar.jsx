"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import { MenuIcon, XIcon, LogoutIcon, PencilIcon, DashboardIcon, CogIcon, UserIcon, SearchIcon } from "../icons"

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsProfileOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              BlogApp
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-gray-700 hover:text-blue-600 ${location.pathname === "/" ? "font-medium text-blue-600" : ""}`}
              >
                Home
              </Link>

              <Link to="/search" className="text-gray-700 hover:text-blue-600 flex items-center">
                <SearchIcon className="w-4 h-4 mr-1" />
                Search
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  className={`text-gray-700 hover:text-blue-600 ${location.pathname === "/dashboard" ? "font-medium text-blue-600" : ""}`}
                >
                  Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`text-gray-700 hover:text-blue-600 ${location.pathname === "/admin" ? "font-medium text-blue-600" : ""}`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-medium">{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-gray-700">{user.username}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <DashboardIcon className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/create-post"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <PencilIcon className="w-4 h-4 inline mr-2" />
                      Create Post
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <CogIcon className="w-4 h-4 inline mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogoutIcon className="w-4 h-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 focus:outline-none">
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4 py-2">
            <Link
              to="/search"
              className="flex items-center justify-center py-3 text-gray-700 hover:text-blue-600 border-b border-gray-100"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Search
            </Link>

            <nav className="mt-4 space-y-3">
              <Link to="/" className="block text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-post"
                    className="block text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Post
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-medium text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-700">{user.username}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center text-red-600">
                      <LogoutIcon className="w-5 h-5 mr-2" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" fullWidth>
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button fullWidth>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
