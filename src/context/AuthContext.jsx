"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()

  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialized(true)
      return
    }

    try {
      setLoading(true)
      const response = await api.get("/me")

      // Ensure user object has an id property (some APIs use _id instead of id)
      const userData = response.data.user
      if (userData && userData._id && !userData.id) {
        userData.id = userData._id
      }

      setUser(userData)
    } catch (error) {
      console.error("Error fetching current user:", error)
      // Only logout if the error is authentication related
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout(false) // Silent logout
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [token])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await api.post("/login", { email, password })

      // Ensure user object has an id property
      const userData = response.data.user
      if (userData && userData._id && !userData.id) {
        userData.id = userData._id
      }

      setUser(userData)
      setToken(response.data.token)
      localStorage.setItem("token", response.data.token)

      toast.success("Login successful!")
      navigate("/")
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.error || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post("/register", userData)

      // Ensure user object has an id property
      const userDataResponse = response.data.user
      if (userDataResponse && userDataResponse._id && !userDataResponse.id) {
        userDataResponse.id = userDataResponse._id
      }

      setUser(userDataResponse)
      setToken(response.data.token)
      localStorage.setItem("token", response.data.token)

      toast.success("Registration successful!")
      navigate("/")
      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.response?.data?.error || "Registration failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = (showToast = true) => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    if (showToast) {
      toast.success("Logged out successfully")
      navigate("/login")
    }
  }

  const updateUser = (updatedUser) => {
    // Ensure user object has an id property
    if (updatedUser && updatedUser._id && !updatedUser.id) {
      updatedUser.id = updatedUser._id
    }
    setUser(updatedUser)
  }

  const refreshUser = () => {
    if (token) {
      fetchCurrentUser()
    }
  }

  const value = {
    user,
    token,
    loading,
    initialized,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
