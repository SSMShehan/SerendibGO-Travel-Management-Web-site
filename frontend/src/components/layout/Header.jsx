import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Headphones,
  Bell,
  Eye,
  LogIn
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const dropdownRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      setScrolled(isScrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsProfileDropdownOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileSettings = () => {
    const roleRoutes = {
      guide: '/guide/settings',
      admin: '/admin/settings',
      staff: '/staff',
      hotel_owner: '/hotel-owner',
      driver: '/driver',
      vehicle_owner: '/vehicle-owner',
      default: '/profile'
    }
    navigate(roleRoutes[user?.role] || roleRoutes.default)
    setIsProfileDropdownOpen(false)
  }

  const handleSupport = () => {
    navigate(user?.role === 'guide' ? '/guide-support' : '/contact')
    setIsProfileDropdownOpen(false)
  }

  const handleNotifications = () => {
    navigate(user?.role === 'guide' ? '/guide-notifications' : '/notifications')
    setIsProfileDropdownOpen(false)
  }

  const handleViewPublicProfile = () => {
    navigate(user?.role === 'guide' ? `/guides/${user.id}` : '/profile')
    setIsProfileDropdownOpen(false)
  }

  const isActive = (path) => location.pathname === path
  const isHomePage = location.pathname === '/'

  // Dynamic styles based on scroll and page
  const headerBg = scrolled || !isHomePage
    ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-surface-200/50"
    : "bg-transparent"

  const textColor = scrolled || !isHomePage ? "text-surface-800" : "text-white"
  const hoverColor = "hover:text-primary-600"
  const logoColor = scrolled || !isHomePage ? "text-primary-700" : "text-white"
  const logoAccent = scrolled || !isHomePage ? "text-secondary-500" : "text-secondary-400"

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Left Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['/', '/tours', '/guides', '/hotels'].map((path, index) => (
                <Link
                  key={path}
                  to={path}
                  className={`font-medium text-sm tracking-wide transition-colors relative group ${isActive(path) && (scrolled || !isHomePage) ? "text-primary-700 font-semibold" :
                      isActive(path) && (!scrolled && isHomePage) ? "text-white font-bold" :
                        textColor
                    }`}
                >
                  {path === '/' ? 'HOME' : path.slice(1).toUpperCase()}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled || !isHomePage ? 'bg-primary-500' : 'bg-white'}`}></span>
                </Link>
              ))}
            </div>

            {/* Center Brand Name */}
            <Link to="/" className="text-center group relative z-10">
              <span className={`font-display font-bold text-3xl tracking-tight ${logoColor} transition-colors`}>
                SERENDIB
              </span>
              <span className={`font-display font-bold text-3xl ml-1 ${logoAccent} transition-colors`}>
                GO
              </span>
            </Link>

            {/* Right Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['/vehicles', '/custom-trip'].map((path) => (
                <Link
                  key={path}
                  to={path}
                  className={`font-medium text-sm tracking-wide transition-colors relative group ${isActive(path) && (scrolled || !isHomePage) ? "text-primary-700 font-semibold" :
                      isActive(path) && (!scrolled && isHomePage) ? "text-white font-bold" :
                        textColor
                    }`}
                >
                  {path === '/custom-trip' ? 'CUSTOM TRIP' : path.slice(1).toUpperCase()}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled || !isHomePage ? 'bg-primary-500' : 'bg-white'}`}></span>
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${scrolled || !isHomePage
                        ? "bg-surface-100/50 hover:bg-surface-200/50 text-surface-800"
                        : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                      }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium text-sm max-w-[100px] truncate">
                      {user?.name || user?.firstName || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-surface-100 overflow-hidden ring-1 ring-black/5"
                      >
                        <div className="px-6 py-4 bg-surface-50/50 border-b border-surface-100">
                          <p className="font-bold text-surface-900 truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'User'}
                          </p>
                          <p className="text-xs text-surface-500 mt-0.5 truncate">{user?.email}</p>
                        </div>

                        <div className="py-2">
                          <DropdownItem
                            icon={User}
                            label="Dashboard"
                            onClick={() => {
                              const roleRoutes = {
                                guide: '/guide', admin: '/admin', staff: '/staff',
                                hotel_owner: '/hotel-owner', driver: '/driver', vehicle_owner: '/vehicle-owner',
                                default: '/dashboard'
                              }
                              navigate(roleRoutes[user?.role] || roleRoutes.default)
                              setIsProfileDropdownOpen(false)
                            }}
                          />
                          <DropdownItem icon={Eye} label="View Public Profile" onClick={handleViewPublicProfile} />
                          <DropdownItem icon={Settings} label="Profile Settings" onClick={handleProfileSettings} />
                          <DropdownItem icon={Headphones} label="Support" onClick={handleSupport} />
                          <DropdownItem icon={Bell} label="Notifications" onClick={handleNotifications} />
                        </div>

                        <div className="border-t border-surface-100 p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium text-sm">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 ${scrolled || !isHomePage
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30"
                      : "bg-white text-primary-700 hover:bg-surface-50 shadow-lg"
                    }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>LOGIN</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${textColor}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-surface-200 absolute left-0 right-0 shadow-2xl rounded-b-2xl"
              >
                <div className="flex flex-col p-4 space-y-2">
                  {['/', '/tours', '/guides', '/hotels', '/vehicles', '/custom-trip', '/my-bookings'].map((path) => (
                    <Link
                      key={path}
                      to={path}
                      className={`font-medium px-4 py-3 rounded-xl transition-colors ${isActive(path) ? "bg-primary-50 text-primary-700" : "text-surface-700 hover:bg-surface-50"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {path === '/' ? 'Home' : path === '/custom-trip' ? 'Custom Trip' : path === '/my-bookings' ? 'My Bookings' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                    </Link>
                  ))}

                  <div className="border-t border-surface-100 my-2 pt-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 flex items-center space-x-3 text-surface-900 font-semibold">
                          <User className="w-5 h-5 text-primary-600" />
                          <span>{user?.name || user?.firstName || 'User'}</span>
                        </div>
                        <DropdownItem icon={User} label="Dashboard" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} />
                        <DropdownItem icon={Settings} label="Settings" onClick={() => { handleProfileSettings(); setIsMenuOpen(false); }} />
                        <button
                          onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 w-full bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  )
}

const DropdownItem = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-surface-600 hover:bg-surface-50 hover:text-primary-700 transition-colors"
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium text-sm">{label}</span>
  </button>
)

export default Header