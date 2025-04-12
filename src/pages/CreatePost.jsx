import PostEditor from "../components/PostEditor"

const CreatePost = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Post</h1>

      <PostEditor />
    </div>
  )
}

export default CreatePost
