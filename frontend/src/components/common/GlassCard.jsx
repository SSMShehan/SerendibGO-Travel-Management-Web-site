import React from 'react'
import { motion } from 'framer-motion'

const GlassCard = ({ children, className = "", hoverEffect = false, ...props }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`
        bg-white/10 backdrop-blur-md border border-white/20 
        shadow-xl rounded-2xl overflow-hidden
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export default GlassCard
