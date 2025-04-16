
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
  
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <GameProvider>
        {!isPlaying ? (
          <Menu onStart={() => setIsPlaying(true)} />
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