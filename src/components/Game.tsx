
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Sky, 
  PointerLockControls, 
  useTexture, 
  Text,
  useKeyboardControls,
  Stars,
  Sparkles,
  Cloud,
  Environment
} from '@react-three/drei'
import * as THREE from 'three'
import { Maze } from './Maze'
import { Player } from './Player'
import { HUD } from './HUD'
import { PauseMenu } from './PauseMenu'
import { VictoryScreen } from './VictoryScreen'
import { useGame } from '../context/GameContext'

export function Game() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const { 
    isPaused, 
    setIsPaused, 
    isRunning, 
    setIsRunning,
    resetGame 
  } = useGame()
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  
  // Handle keyboard controls for pausing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showVictory) {
        setIsPaused(!isPaused)
        setShowPauseMenu(!showPauseMenu)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, showPauseMenu, setIsPaused, showVictory])
  
  // Lock/unlock pointer based on pause state
  useEffect(() => {
    if (controlsRef.current) {
      if (isPaused || showVictory) {
        controlsRef.current.unlock()
      } else {
        controlsRef.current.lock()
      }
    }
  }, [isPaused, showVictory])
  
  // Handle victory
  useEffect(() => {
    const handleVictory = () => {
      setIsPaused(true)
      setShowVictory(true)
    }
    
    // Subscribe to victory event
    window.addEventListener('maze-victory', handleVictory)
    return () => window.removeEventListener('maze-victory', handleVictory)
  }, [setIsPaused])
  
  const handleRestart = () => {
    resetGame()
    setIsPaused(false)
    setShowVictory(false)
    setIsRunning(true)
  }
  
  const handleMainMenu = () => {
    window.location.reload()
  }
  
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
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
      
      {/* Atmosphere */}
      <Sparkles count={100} scale={20} size={1} speed={0.2} opacity={0.1} />
      <Cloud
        opacity={0.2}
        speed={0.1}
        width={20}
        depth={1.5}
        segments={20}
        position={[0, 10, 0]}
      />
      
      {/* Game Elements */}
      <Maze />
      <Player onVictory={() => {
        const victoryEvent = new Event('maze-victory')
        window.dispatchEvent(victoryEvent)
      }} />
      
      {/* Controls */}
      <PointerLockControls ref={controlsRef} />
      
      {/* UI Elements */}
      <HUD />
      {showPauseMenu && !showVictory && (
        <PauseMenu onResume={() => {
          setIsPaused(false)
          setShowPauseMenu(false)
        }} />
      )}
      {showVictory && (
        <VictoryScreen 
          onRestart={handleRestart} 
          onMainMenu={handleMainMenu} 
        />
      )}
    </>
  )
}