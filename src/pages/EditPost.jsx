"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import PostEditor from "../components/PostEditor"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const EditPost = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/posts/${id}`)
        setPost(response.data)

        // Check if user is authorized to edit this post
        if (user && (user.id === response.data.author._id || user.role === "admin")) {
          // User is authorized
        } else {
          toast.error("You are not authorized to edit this post")
          navigate(`/posts/${id}`)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast.error("Failed to load post")
        navigate("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, user, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Post</h1>

      {post && <PostEditor initialData={post} isEditing={true} />}
    </div>
  )
}

export default EditPost
