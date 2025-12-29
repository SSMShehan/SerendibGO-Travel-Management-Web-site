import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from '../components/common/GlassCard'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const response = await registerUser(data)
      // Redirect based on user role
      if (data.role === 'guide') {
        navigate('/guide/dashboard')
      } else if (data.role === 'staff') {
        navigate('/staff')
      } else if (data.role === 'driver') {
        // Redirect to profile page for driver completion
        navigate('/profile')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      // Error is handled in the auth context
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/bg1.jpg)', // Use a scenic authentication background
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[4px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <GlassCard className="p-8 md:p-10 border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 transform -rotate-3">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-display font-bold text-surface-900 mb-2">
              Join SerendibGo
            </h2>
            <p className="text-surface-600">
              Create your account and start your Sri Lankan adventure
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">First Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400 group-hover:text-primary-500 transition-colors" />
                </div>
                {errors.firstName && <span className="text-xs text-red-500 ml-1">{errors.firstName.message}</span>}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">Last Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Doe"
                    className={`w-full pl-4 pr-4 py-4 bg-surface-50 border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                  />
                </div>
                {errors.lastName && <span className="text-xs text-red-500 ml-1">{errors.lastName.message}</span>}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-surface-400 group-hover:text-primary-500'} transition-colors`} />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 font-medium ml-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Phone Number</label>
              <div className="relative group">
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  className={`w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Invalid phone number',
                    },
                  })}
                />
                <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${errors.phone ? 'text-red-500' : 'text-surface-400 group-hover:text-primary-500'} transition-colors`} />
              </div>
              {errors.phone && (
                <span className="text-xs text-red-500 font-medium ml-1">
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Account Type</label>
              <div className="relative group">
                <select
                  className={`w-full pl-4 pr-10 py-4 bg-surface-50 border ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all appearance-none cursor-pointer group-hover:bg-white`}
                  {...register('role', {
                    required: 'Please select an account type',
                  })}
                >
                  <option value="">Select account type</option>
                  <option value="tourist">Tourist</option>
                  <option value="hotel_owner">Hotel Owner</option>
                  <option value="guide">Tour Guide</option>
                  <option value="driver">Driver</option>
                  <option value="staff">Staff</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {errors.role && (
                <span className="text-xs text-red-500 font-medium ml-1">
                  {errors.role.message}
                </span>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-10 py-4 bg-surface-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                    {...register('password', {
                      required: 'Required',
                      minLength: { value: 6, message: 'Min 6 chars' },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Weak password' },
                    })}
                  />
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-500' : 'text-surface-400 group-hover:text-primary-500'} transition-colors`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"><Eye className="w-4 h-4" /></button>
                </div>
                {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-10 py-4 bg-surface-50 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-surface-200 focus:ring-primary-500'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all group-hover:bg-white`}
                    {...register('confirmPassword', {
                      required: 'Required',
                      validate: (val) => val === password || 'No match',
                    })}
                  />
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${errors.confirmPassword ? 'text-red-500' : 'text-surface-400 group-hover:text-primary-500'} transition-colors`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"><Eye className="w-4 h-4" /></button>
                </div>
                {errors.confirmPassword && <span className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                  {...register('agreeTerms', { required: 'You must agree to the terms' })}
                />
                <span className="ml-2 text-sm text-surface-600 group-hover:text-surface-800 transition-colors">
                  I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && <span className="text-xs text-red-500 ml-1 block">{errors.agreeTerms.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transform transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Social Registration */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 backdrop-blur-sm text-surface-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button className="flex items-center justify-center px-4 py-3 border border-surface-200 rounded-xl shadow-sm bg-white hover:bg-surface-50 transition-colors font-medium text-surface-700">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-surface-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all"
            >
              Sign in here
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Register
