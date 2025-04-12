import { Link } from "react-router-dom"
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              BlogApp
            </Link>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              A modern blogging platform for sharing your thoughts and ideas with the world.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  to="/create-post"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Create Post
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FiGithub size={20} />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FiTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FiLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FiMail size={20} />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-300">
            &copy; {currentYear} BlogApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
