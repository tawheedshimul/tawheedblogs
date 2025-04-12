"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiMessageSquare } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { timeAgo } from "../utils/formatDate"

const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await api.get("/messages")
        setConversations(response.data)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No conversations yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a conversation by visiting a user's profile and sending them a message.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => (
              <li key={conversation.user._id}>
                <Link
                  to={`/messages/${conversation.user._id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={
                            conversation.user.avatar ||
                            `https://ui-avatars.com/api/?name=${conversation.user.username}&background=random`
                          }
                          alt={conversation.user.username}
                          className="w-10 h-10 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {conversation.user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {conversation.lastMessage.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {timeAgo(conversation.lastMessage.createdAt)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Messages
