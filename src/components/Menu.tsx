
import { Button } from './ui/button'
import { motion } from 'framer-motion'

interface MenuProps {
  onStart: () => void
}

export function Menu({ onStart }: MenuProps) {
  const handleClick = () => {
    console.log("Button clicked")
    onStart()
  }
  
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
        
        <button 
          onClick={handleClick}
          className="px-8 py-6 text-lg bg-white text-black hover:bg-gray-200 transition-colors rounded-md"
        >
          Enter the Maze
        </button>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Use WASD to move and mouse to look around</p>
          <p>Press ESC to pause</p>
        </div>
      </motion.div>
    </div>
  )
}