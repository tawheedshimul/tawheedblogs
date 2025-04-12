import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { FiImage, FiX } from "react-icons/fi"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import api from "../utils/api"

const PostEditor = ({ initialData = null, isEditing = false }) => {
  const [title, setTitle] = useState(initialData?.title || "")
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image || "")
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.content || "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none p-2 min-h-[300px]",
      },
    },
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = useCallback(() => {
    setImage(null)
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!editor?.getText().trim()) {
      toast.error("Content is required")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", editor?.getHTML() || "")
      formData.append("tags", tags)
      formData.append("featured", featured)

      if (image) {
        formData.append("image", image)
      } else if (!imagePreview && initialData?.image) {
        // If editing and image is removed
        formData.append("removeImage", "true")
      }

      let response

      if (isEditing) {
        response = await api.patch(`/posts/${initialData._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Post updated successfully")
      } else {
        response = await api.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Post created successfully")
      }

      navigate(`/posts/${response.data._id}`)
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error(error.response?.data?.error || "Failed to save post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content *
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 overflow-hidden">
          {/* Editor toolbar */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("bold") ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("italic") ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor?.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              disabled={!editor}
            >
              Quote
            </button>
          </div>
          
          {/* Editor content */}
          <EditorContent editor={editor} className="p-4" />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="technology, programming, web"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Featured Image
        </label>

        {imagePreview ? (
          <div className="relative mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-md"
              loading="lazy"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              aria-label="Remove image"
            >
              <FiX size={20} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <FiImage className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Mark as featured post
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          disabled={loading || !editor}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? "Updating..." : "Creating..."}
            </span>
          ) : (
            <span>{isEditing ? "Update Post" : "Create Post"}</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default PostEditor;