
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Sky, 
  PointerLockControls, 
  useTexture, 
  Text,
  useKeyboardControls
} from '@react-three/drei'
import * as THREE from 'three'
import { Maze } from './Maze'
import { Player } from './Player'
import { HUD } from './HUD'
import { useGame } from '../context/GameContext'
import { PauseMenu } from './PauseMenu'

export function Game() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const { isPaused, setIsPaused } = useGame()
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  
  // Handle keyboard controls for pausing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaused(!isPaused)
        setShowPauseMenu(!showPauseMenu)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, showPauseMenu, setIsPaused])
  
  // Lock/unlock pointer based on pause state
  useEffect(() => {
    if (controlsRef.current) {
      if (isPaused) {
        controlsRef.current.unlock()
      } else {
        controlsRef.current.lock()
      }
    }
  }, [isPaused])
  
  return (
    <>
      {/* Environment */}
      <fog attach="fog" args={['#1a1a1a', 1, 30]} />
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <Sky sunPosition={[100, 10, 100]} />
      
      {/* Game Elements */}
      <Maze />
      <Player />
      
      {/* Controls */}
      <PointerLockControls ref={controlsRef} />
      
      {/* UI Elements */}
      <HUD />
      {showPauseMenu && <PauseMenu onResume={() => {
        setIsPaused(false)
        setShowPauseMenu(false)
      }} />}
    </>
  )
}