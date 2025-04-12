"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FiSend, FiArrowLeft, FiInfo, FiImage, FiSmile } from "react-icons/fi"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { formatDateTime } from "../utils/formatDate"

const Conversation = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipient, setRecipient] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const messageContainerRef = useRef(null)

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/messages/${id}`)
        setMessages(response.data)

        // Set recipient from the first message
        if (response.data.length > 0) {
          const firstMessage = response.data[0]
          const otherUser = firstMessage.sender._id === user.id ? firstMessage.recipient : firstMessage.sender
          setRecipient(otherUser)
        } else {
          // If no messages, fetch user info
          const userResponse = await api.get(`/users/${id}`)
          setRecipient(userResponse.data.user)
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
        toast.error("Failed to load conversation")
        navigate("/messages")
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000)
    return () => clearInterval(interval)
  }, [id, user.id, navigate])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      return
    }

    try {
      setSending(true)
      const response = await api.post("/messages", {
        recipientId: id,
        text: newMessage.trim(),
      })

      setMessages([...messages, response.data])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const viewProfile = () => {
    if (recipient) {
      navigate(`/profile/${recipient._id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center">
            <Link
              to="/messages"
              className="mr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <FiArrowLeft size={20} />
            </Link>

            {recipient && (
              <div className="flex items-center cursor-pointer" onClick={viewProfile}>
                <img
                  src={recipient.avatar || `https://ui-avatars.com/api/?name=${recipient.username}&background=random`}
                  alt={recipient.username}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{recipient.username}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {recipient.online ? "Online" : "Tap to view profile"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={viewProfile}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <FiInfo size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto" ref={messageContainerRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.sender._id === user.id
                const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id

                return (
                  <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-end max-w-[75%]">
                      {!isCurrentUser && showAvatar ? (
                        <img
                          src={
                            message.sender.avatar ||
                            `https://ui-avatars.com/api/?name=${message.sender.username || "/placeholder.svg"}&background=random`
                          }
                          alt={message.sender.username}
                          className="w-8 h-8 rounded-full mr-2 mb-1 object-cover"
                        />
                      ) : (
                        !isCurrentUser && <div className="w-8 mr-2"></div>
                      )}

                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-primary-600 text-white rounded-br-none"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser ? "text-primary-100" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sticky bottom-0 bg-white dark:bg-gray-800">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <FiSmile size={20} />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <FiImage size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {sending ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              ) : (
                <FiSend />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Conversation
