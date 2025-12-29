import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-error/10 rounded-full flex items-center justify-center">
          <span className="text-6xl">😵</span>
        </div>
        <h1 className="text-6xl font-bold text-base-content mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Page Not Found
        </h2>
        <p className="text-base-content/70 mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
