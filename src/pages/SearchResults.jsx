"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import api from "../utils/api"
import PostGrid from "../components/posts/PostGrid"
import Pagination from "../components/common/Pagination"
import LoadingSpinner from "../components/common/LoadingSpinner"
import SearchBar from "../components/common/SearchBar"

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await api.get("/api/posts/search", {
          params: { query, page, limit: 9 },
        })

        setResults(response.data.results)
        setTotalPages(response.data.pages)
        setTotalResults(response.data.total)
      } catch (err) {
        console.error("Error searching posts:", err)
        setError("Failed to load search results")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, page])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Articles</h1>
        <SearchBar className="max-w-3xl" initialValue={query} />

        {query && !loading && (
          <div className="mt-4 text-gray-600">
            {totalResults} {totalResults === 1 ? "result" : "results"} found for "{query}"
          </div>
        )}
      </div>

      {!query && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Find Articles</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Enter a search term above to find posts by title, content, or tags.
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <Link to="/?tag=technology" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
              Technology
            </Link>
            <Link to="/?tag=programming" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
              Programming
            </Link>
            <Link to="/?tag=design" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
              Design
            </Link>
            <Link to="/?tag=business" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
              Business
            </Link>
            <Link to="/?tag=lifestyle" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
              Lifestyle
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 bg-white p-6 rounded-lg shadow-md">{error}</div>
      ) : (
        query && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-lg text-gray-600 mb-4">No results found for your search</p>
                <p className="text-gray-500 mb-6">Try different keywords or browse by category</p>
                <Link to="/" className="text-blue-600 hover:underline">
                  Return to home page
                </Link>
              </div>
            ) : (
              <>
                <PostGrid posts={results} />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </>
        )
      )}
    </div>
  )
}

export default SearchResults
