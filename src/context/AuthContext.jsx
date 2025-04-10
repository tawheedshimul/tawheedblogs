"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "react-toastify"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const response = await api.get("/api/me")
          setUser(response.data.user)
        } catch (error) {
          console.error("Failed to fetch user:", error)
          logout()
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/login", { email, password })
      const { user, token } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)
      toast.success("Login successful!")
      return true
    } catch (error) {
      const message = error.response?.data?.error || "Login failed"
      toast.error(message)
      return false
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/api/register", { username, email, password })
      const { user, token } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)
      toast.success("Registration successful!")
      return true
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed"
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    toast.info("You have been logged out")
  }

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
