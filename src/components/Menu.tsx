
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MenuProps {
  onStart: () => void
}

export function Menu({ onStart }: MenuProps) {
  const [isPromptVisible, setIsPromptVisible] = useState(false)
  
  // Handle Enter key press to start the game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        console.log("Enter key pressed")
        onStart()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    // Show the prompt after a short delay
    const promptTimer = setTimeout(() => {
      setIsPromptVisible(true)
    }, 1000)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(promptTimer)
    }
  }, [onStart])
  
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
          initial={{ opacity: 0 }}
          animate={{ opacity: isPromptVisible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="text-2xl font-bold text-white">
            Press <span className="text-yellow-400">ENTER</span> to start
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-2 text-yellow-400 text-lg"
          >
            ↓
          </motion.div>
        </motion.div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Use WASD to move and mouse to look around</p>
          <p>Press ESC to pause</p>
        </div>
      </motion.div>
    </div>
  )
}