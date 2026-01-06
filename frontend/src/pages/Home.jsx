import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Shield,
  Heart,
  Smartphone,
  Camera,
  Compass
} from 'lucide-react'

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const Home = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Manually trigger video play to handle autoplay restrictions
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error)
        setVideoError(true)
      })
    }
  }, [])

  const features = [
    {
      icon: <Compass className="w-8 h-8 text-primary-500" />,
      title: "Authentic Exploration",
      description: "Discover hidden gems and local secrets beyond the tourist trails."
    },
    {
      icon: <Calendar className="w-8 h-8 text-secondary-500" />,
      title: "Seamless Booking",
      description: "Plan your entire journey with intuitive tools and instant confirmations."
    },
    {
      icon: <Users className="w-8 h-8 text-accent-500" />,
      title: "Local Experts",
      description: "Connect with passionate guides who know every story of the land."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Safe & Secure",
      description: "Travel with peace of mind knowing your safety is our priority."
    }
  ]

  const trendingTours = [
    {
      id: 1,
      title: "Wilderness of Yala",
      duration: "3 Days / 2 Nights",
      price: "$450",
      image: "https://images.unsplash.com/photo-1547975172-a8c628e46950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Spot leopards and elephants in their natural habitat."
    },
    {
      id: 2,
      title: "Cultural Heritage Triangle",
      duration: "5 Days / 4 Nights",
      price: "$650",
      image: "/traditional-stilt-fishermen-sri-lanka.jpg",
      description: "Explore ancient cities, temples, and the Lion Rock fortress."
    },
    {
      id: 3,
      title: "Ella Mountain Retreat",
      duration: "2 Days / 1 Night",
      price: "$250",
      image: "https://images.unsplash.com/photo-1588665552328-93527d6ea573?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Scenic train rides and hiking through misty tea plantations."
    }
  ]

  const stats = [
    { number: "500+", label: "Curated Tours" },
    { number: "15k+", label: "Happy Travelers" },
    { number: "100%", label: "Satisfaction" },
    { number: "24/7", label: "Support" }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Adventure Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      text: "The most incredible way to experience Sri Lanka. Every detail was perfect, from the hidden waterfalls to the local cuisine."
    },
    {
      name: "David Chen",
      role: "Photographer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      text: "As a photographer, I was blown away by the locations we visited. The guides knew exactly where to go for the best shots."
    },
    {
      name: "Elena Rodriguez",
      role: "Culture Lover",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      text: "Immersive, authentic, and truly magical. I felt deeply connected to the culture and history of this beautiful island."
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-surface-50 overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Video Background */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
          {!videoError ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-110"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/glassmorphism-bg-1.jpg"
              onError={() => setVideoError(true)}
            >
              <source src="https://ik.imagekit.io/serandibGo/homepage-background.mp4?updatedAt=1767710095928" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center scale-110"
              style={{ backgroundImage: 'url("/glassmorphism-bg-1.jpg")' }}
            />
          )}
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div style={{ opacity, y: y2 }}>
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl"
            >
              <span className="block text-2xl md:text-3xl font-sans font-light tracking-[0.2em] mb-4 text-secondary-300 uppercase">
                Welcome to
              </span>
              Paradise Found
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto drop-shadow-lg"
            >
              Experience the magic of Sri Lanka with curated journeys designed for the modern explorer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/tours" className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/50 text-white rounded-full overflow-hidden transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                <span className="relative z-10 font-bold tracking-wide flex items-center">
                  START EXPLORING <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/50 to-secondary-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link to="/custom-trip" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-lg shadow-primary-900/20 transition-all hover:scale-105 active:scale-95 flex items-center">
                PLAN MY TRIP
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/80 z-20"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent mx-auto" />
          <span className="text-[10px] uppercase tracking-widest mt-2 block">Scroll</span>
        </motion.div>
      </section>

      {/* Stats Section with Glass Effect */}
      <section className="relative z-30 -mt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-surface-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - 3D Tilt Cards */}
      <section className="py-32 relative bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary-600 font-bold tracking-widest uppercase text-sm"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold text-surface-900 mt-2 mb-6"
            >
              Redefining Travel
            </motion.h2>
            <p className="text-xl text-surface-500 font-light">
              We don't just take you places; we transport you to new worlds of experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <TiltCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours - Horizontal Scroll with Snap */}
      <section className="py-32 bg-surface-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-secondary-500 font-bold tracking-widest uppercase text-sm block mb-2">Destinations</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold">Trending Now</h2>
            </div>
            <Link to="/tours" className="hidden md:flex items-center text-white/80 hover:text-white transition-colors group">
              View All Tours <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingTours.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/tours" className="inline-flex items-center text-secondary-400 font-bold">
              View All Tours <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Immersive CTA Section */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary-900">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800 opacity-90" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("/patterns/topography.svg")' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-8"
          >
            Your Journey Begins Here
          </motion.h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-12 font-light max-w-2xl mx-auto">
            Join thousands of modern explorers uncovering the secrets of Serendib.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="inline-block bg-white text-primary-900 px-12 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/20 transition-shadow"
            >
              Start Your Adventure
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-4">Traveler Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-surface-50 rounded-2xl p-8 relative hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="mt-6 mb-6">
                  <p className="text-surface-600 italic leading-relaxed text-lg">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-primary-100" />
                  <div>
                    <h4 className="font-bold text-surface-900">{testimonial.name}</h4>
                    <span className="text-sm text-surface-500">{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

const TiltCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="bg-white p-8 rounded-3xl shadow-lg border border-surface-100 hover:shadow-xl transition-all duration-300 group"
  >
    <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-50 transition-colors duration-300">
      <div className="transform group-hover:scale-110 transition-transform duration-300">
        {feature.icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-surface-900 mb-3 group-hover:text-primary-600 transition-colors">
      {feature.title}
    </h3>
    <p className="text-surface-500 leading-relaxed">
      {feature.description}
    </p>
  </motion.div>
)

const TourCard = ({ tour, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    className="group relative overflow-hidden rounded-3xl h-[450px]"
  >
    <div className="absolute inset-0 bg-surface-800">
      <img
        src={tour.image}
        alt={tour.title}
        className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700 ease-out"
      />
    </div>

    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 flex flex-col justify-end">
      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-secondary-400 font-bold text-xs uppercase tracking-wider mb-2 block">
          {tour.duration}
        </span>
        <h3 className="text-2xl font-bold text-white mb-2">{tour.title}</h3>
        <p className="text-white/80 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          {tour.description}
        </p>
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
          <span className="text-xl font-bold text-white">{tour.price}</span>
          <span className="text-sm font-bold text-white underline decoration-secondary-500 underline-offset-4 cursor-pointer">View Details</span>
        </div>
      </div>
    </div>
  </motion.div>
)

export default Home
