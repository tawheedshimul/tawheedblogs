import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "https://blog-backend-new-three.vercel.app/api"

// Create a cache for GET requests
const cache = new Map()

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Check if we should use cached data
    if (config.method === "get" && config.cache !== false) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      const cachedData = cache.get(cacheKey)

      if (cachedData) {
        // Set a flag to indicate we're using cached data
        config.adapter = () => {
          return Promise.resolve({
            data: cachedData.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          })
        }
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors and cache responses
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === "get" && response.config.cache !== false) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`

      // Store in cache with timestamp
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      })
    }
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Function to clear cache
api.clearCache = () => {
  cache.clear()
}

// Function to clear specific cache entry
api.clearCacheFor = (url, params = {}) => {
  const cacheKey = `${url}${JSON.stringify(params)}`
  cache.delete(cacheKey)
}

// Function to invalidate cache older than specified time
api.invalidateCache = (maxAge = 5 * 60 * 1000) => {
  // Default 5 minutes
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > maxAge) {
      cache.delete(key)
    }
  }
}

// Set up cache invalidation every 5 minutes
setInterval(
  () => {
    api.invalidateCache()
  },
  5 * 60 * 1000,
)

export default api
