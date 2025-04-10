"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../common/Button"
import InputField from "./InputField"
import { ImageIcon } from "../icons"

const PostForm = ({ onSubmit, isSubmitting, initialValues, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    content: initialValues.content || "",
    excerpt: initialValues.excerpt || "",
    tags: initialValues.tags || "",
    featured: initialValues.featured || false,
    image: initialValues.image || null,
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(initialValues.image || "")

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size should be less than 5MB" }))
      return
    }

    setFormData((prev) => ({ ...prev, image: file }))
    setImagePreview(URL.createObjectURL(file))

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit(formData)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter post title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={12}
          className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.content ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Write your post content here..."
          required
        ></textarea>
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      <InputField
        label="Excerpt (optional)"
        name="excerpt"
        value={formData.excerpt}
        onChange={handleChange}
        placeholder="Brief summary of your post (max 200 characters)"
      />

      <InputField
        label="Tags (optional)"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Separate tags with commas (e.g. technology, programming, web)"
      />

      <div>
        <div className="flex items-center mb-4">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Feature this post on the homepage
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image (optional)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="mx-auto h-64 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("")
                    setFormData((prev) => ({ ...prev, image: null }))
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      ref={fileInputRef}
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
        </div>
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEditing ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  )
}

export default PostForm
