
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Sky, 
  PointerLockControls, 
  Stars,
  Sparkles,
  Cloud,
  Html
} from '@react-three/drei'
import * as THREE from 'three'
import { Maze } from './Maze'
import { Player } from './Player'
import { HUD } from './HUD'
import { PauseMenu } from './PauseMenu'
import { VictoryScreen } from './VictoryScreen'
import { useGame } from '../context/GameContext'
import { Controls } from '../main'

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
  const [showClickToPlay, setShowClickToPlay] = useState(true)
  
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
        // Add a small delay to ensure the controls lock properly
        setTimeout(() => {
          try {
            controlsRef.current.lock()
          } catch (error) {
            console.log("Could not lock controls, will try again on click")
          }
        }, 100)
      }
    }
  }, [isPaused, showVictory])
  
  // Add click handler to lock controls
  useEffect(() => {
    const handleClick = () => {
      if (controlsRef.current && !isPaused && !showVictory) {
        try {
          controlsRef.current.lock()
          setShowClickToPlay(false)
        } catch (error) {
          console.log("Could not lock controls on click")
        }
      }
    }
    
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
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
    setShowClickToPlay(true)
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
      
      {/* Click to start overlay */}
      {!isPaused && isRunning && !showVictory && showClickToPlay && (
        <Html fullscreen>
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'all', // Changed to 'all' to ensure clicks work
              userSelect: 'none',
              color: 'white',
              fontFamily: 'sans-serif',
              fontSize: '24px',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            }}
            onClick={() => {
              if (controlsRef.current) {
                try {
                  controlsRef.current.lock()
                  setShowClickToPlay(false)
                } catch (error) {
                  console.log("Could not lock controls on overlay click")
                }
              }
            }}
          >
            <div>
              <p>Click to play</p>
              <p style={{ fontSize: '16px', marginTop: '10px' }}>Use WASD to move and mouse to look around</p>
              <p style={{ fontSize: '14px', marginTop: '20px', color: '#aaffaa' }}>
                Hold keys to move continuously
              </p>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}