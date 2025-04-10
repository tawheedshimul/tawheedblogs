"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../utils/api"
import PostForm from "../components/forms/PostForm"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { useAuth } from "../context/AuthContext"

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/posts/${id}`)
        setPost(response.data)

        // Check if user can edit this post
        if (user && response.data.author._id !== user.id && !isAdmin) {
          setError("You don't have permission to edit this post")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post. You may not have permission to edit it.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, user, isAdmin])

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)

      // Create FormData object for file upload
      const postData = new FormData()
      postData.append("title", formData.title)
      postData.append("content", formData.content)
      postData.append("excerpt", formData.excerpt)
      postData.append("tags", formData.tags)
      postData.append("featured", formData.featured)

      if (formData.image && formData.image !== post.image) {
        postData.append("image", formData.image)
      }

      await api.patch(`/api/posts/${id}`, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Post updated successfully!")
      navigate(`/posts/${id}`)
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update post"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!post) return null

  const initialValues = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || "",
    tags: post.tags.join(", "),
    featured: post.featured,
    image: post.image,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Post</h1>

          <PostForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialValues={initialValues}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  )
}

export default EditPost
