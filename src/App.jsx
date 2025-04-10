"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PostDetail from "./pages/PostDetail"
import CreatePost from "./pages/CreatePost"
import EditPost from "./pages/EditPost"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import SearchResults from "./pages/SearchResults"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import { toast } from "react-toastify"

function App() {
  const { user, isAdmin } = useAuth()

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" />

    // Only allow admin access to admin routes
    if (adminOnly && !isAdmin) {
      toast.error("You don't have permission to access this page")
      return <Navigate to="/" />
    }

    return children
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Protected routes */}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              // <ProtectedRoute adminOnly={true}>
                
              // </ProtectedRoute>
              <AdminDashboard />
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
