
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface MenuProps {
  onStart: () => void
}

export function Menu({ onStart }: MenuProps) {
  const [isHovering, setIsHovering] = useState(false)
  
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold mb-2 tracking-tighter">MAZE RUNNER</h1>
        <p className="text-xl mb-8 text-gray-400">Navigate the labyrinth. Find the exit.</p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Button 
            onClick={onStart}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="px-8 py-6 text-lg bg-white text-black hover:bg-gray-200 transition-colors relative overflow-hidden"
          >
            <span className="relative z-10">Enter the Maze</span>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ x: '-100%' }}
              animate={{ x: isHovering ? '0%' : '-100%' }}
              transition={{ duration: 0.3 }}
            />
          </Button>
        </motion.div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Use WASD to move and mouse to look around</p>
          <p>Press ESC to pause</p>
        </div>
      </motion.div>
    </div>
  )
}