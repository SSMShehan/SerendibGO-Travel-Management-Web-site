import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import Footer from './Footer'
import Chatbot from '../chatbot/Chatbot'
import { AnimatePresence, motion } from 'framer-motion'

const Layout = () => {
  const location = useLocation()
  const { user } = useAuth()

  // Hide header for guide dashboard, staff dashboard, admin dashboard and related pages
  const shouldHideHeader = (
    (user?.role === 'guide' && (
      location.pathname.startsWith('/guide/dashboard') ||
      location.pathname.startsWith('/guide-support') ||
      location.pathname.startsWith('/guide-notifications')
    )) ||
    (user?.role === 'staff' && location.pathname.startsWith('/staff')) ||
    (user?.role === 'admin' && (
      location.pathname.startsWith('/staff') ||
      location.pathname.startsWith('/admin')
    ))
  )

  const isHomePage = location.pathname === '/'
  // Main content padding logic
  const mainClassName = isHomePage ? 'flex-1' : 'flex-1 pt-20'

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-surface-50">
      {/* Global Background Elements - Only visible on non-home pages or where desired */}
      {!isHomePage && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          {/* Ambient Gradients - Tropical Luxe Theme */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-100/30 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>
      )}

      {!shouldHideHeader && <Header />}

      <main className={`relative z-10 ${mainClassName}`}>
        {/* Page Transition Wrapper */}
        <Outlet />
      </main>

      {!shouldHideHeader && <Footer />}
      {!shouldHideHeader && <Chatbot />}
    </div>
  )
}

export default Layout
