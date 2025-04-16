
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Loader } from './components/Loader'
import { Game } from './components/Game'
import { Menu } from './components/Menu'
import { GameProvider } from './context/GameContext'
import './App.css'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const handleStartGame = () => {
    console.log("Starting game...")
    setIsPlaying(true)
  }
  
  // Add keyboard focus to the window when the app loads
  useEffect(() => {
    window.focus()
    
    // Prevent browser navigation with keyboard
    const preventNavigation = (e: KeyboardEvent) => {
      // Prevent browser back/forward navigation
      if (e.key === 'Backspace' && e.target === document.body) {
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', preventNavigation)
    
    return () => {
      window.removeEventListener('keydown', preventNavigation)
    }
  }, [])
  
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <GameProvider>
        {!isPlaying ? (
          <Menu onStart={handleStartGame} />
        ) : (
          <Canvas shadows camera={{ fov: 75, position: [0, 1.6, 0] }}>
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
        )}
        <Loader />
      </GameProvider>
    </div>
  )
}

export default App