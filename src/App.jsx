"use client"

import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useAuth } from "./context/AuthContext"
import Layout from "./components/Layout"

// Eagerly load critical components
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"

// Lazy load non-critical components
const PostDetail = lazy(() => import("./pages/PostDetail"))
const CreatePost = lazy(() => import("./pages/CreatePost"))
const EditPost = lazy(() => import("./pages/EditPost"))
const Profile = lazy(() => import("./pages/Profile"))
const EditProfile = lazy(() => import("./pages/EditProfile"))
const Messages = lazy(() => import("./pages/Messages"))
const Conversation = lazy(() => import("./pages/Conversation"))
const Search = lazy(() => import("./pages/Search"))
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"))
const AdminUsers = lazy(() => import("./pages/admin/Users"))
const AdminPosts = lazy(() => import("./pages/admin/Posts"))

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingFallback />
  if (!user) return <Navigate to="/login" />

  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingFallback />
  if (!user || user.role !== "admin") return <Navigate to="/" />

  return children
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="posts/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PostDetail />
              </Suspense>
            }
          />
          <Route
            path="search"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Search />
              </Suspense>
            }
          />
          <Route
            path="profile/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            }
          />

          <Route
            path="create-post"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <CreatePost />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="edit-post/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <EditPost />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="edit-profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <EditProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Messages />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="messages/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Conversation />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <AdminRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminUsers />
                </Suspense>
              </AdminRoute>
            }
          />

          <Route
            path="admin/posts"
            element={
              <AdminRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPosts />
                </Suspense>
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
