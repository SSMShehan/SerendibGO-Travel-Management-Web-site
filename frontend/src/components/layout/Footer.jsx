import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube, ArrowRight } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-white pt-20 pb-10 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-display font-bold text-white">SERENDIB</span>
              <span className="text-2xl font-display font-bold text-secondary-500">GO</span>
            </div>
            <p className="text-surface-400 leading-relaxed">
              Your gateway to amazing Sri Lankan adventures. Discover, book, and experience the beauty of paradise with our curated journeys.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Youtube} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white font-display">Discover</h3>
            <ul className="space-y-4">
              <FooterLink to="/tours" label="All Tours" />
              <FooterLink to="/tours?category=adventure" label="Adventure" />
              <FooterLink to="/tours?category=cultural" label="Heritage & Culture" />
              <FooterLink to="/tours?category=nature" label="Wildlife & Nature" />
              <FooterLink to="/tours?category=beach" label="Beach Stays" />
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white font-display">Support</h3>
            <ul className="space-y-4">
              <FooterLink to="/help" label="Help Center" />
              <FooterLink to="/faq" label="FAQs" />
              <FooterLink to="/contact" label="Contact Us" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/privacy" label="Privacy Policy" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white font-display">Get in Touch</h3>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <MapPin className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-surface-400 leading-tight">
                  123 Colombo Street<br />
                  Colombo 03, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <Phone className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-surface-400 group-hover:text-white transition-colors cursor-pointer">
                  +94 11 234 5678
                </span>
              </li>
              <li className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <Mail className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-surface-400 group-hover:text-white transition-colors cursor-pointer">
                  info@serendibgo.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} SerendibGo. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm text-surface-500">
            <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-primary-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const SocialIcon = ({ icon: Icon }) => (
  <a href="#" className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 hover:bg-primary-600 hover:text-white transition-all duration-300 hover:-translate-y-1">
    <Icon className="w-5 h-5" />
  </a>
)

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-surface-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center group">
      <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 mr-0 group-hover:mr-2 opacity-0 group-hover:opacity-100">
        <ArrowRight className="w-3 h-3 text-secondary-500" />
      </span>
      {label}
    </Link>
  </li>
)

export default Footer
