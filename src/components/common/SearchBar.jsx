"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "../icons"

const SearchBar = ({ minimal = false, initialValue = "", className = "" }) => {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  if (minimal) {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-40 py-2 pl-8 pr-4 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for posts, topics, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 pl-12 pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-6 w-6 text-gray-400" />
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
