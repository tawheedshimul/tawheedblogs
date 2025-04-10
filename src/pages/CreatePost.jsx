"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../utils/api"
import PostForm from "../components/forms/PostForm"

const CreatePost = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

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

      if (formData.image) {
        postData.append("image", formData.image)
      }

      const response = await api.post("/api/posts", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Post created successfully!")
      navigate(`/posts/${response.data._id}`)
    } catch (error) {
      const message = error.response?.data?.error || "Failed to create post"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

          <PostForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialValues={{
              title: "",
              content: "",
              excerpt: "",
              tags: "",
              featured: false,
              image: null,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default CreatePost
