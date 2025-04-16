
import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'
import { Controls } from '../main'

// Define the maze layout for collision detection
// 0 = path, 1 = wall, 2 = start, 3 = end, 4 = checkpoint
const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
]

interface PlayerProps {
  onVictory: () => void
}

export function Player({ onVictory }: PlayerProps) {
  const { camera } = useThree()
  const playerRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const directionRef = useRef(new THREE.Vector3())
  const footstepTimeRef = useRef(0)
  const keysPressed = useRef<Record<string, boolean>>({})
  
  const { 
    isRunning, 
    setIsRunning, 
    isPaused, 
    time, 
    setTime, 
    checkpoints, 
    setCheckpoints,
    currentCheckpoint,
    setCurrentCheckpoint,
    resetGame
  } = useGame()
  
  // Set up keyboard controls with the proper Controls enum
  const [, getKeys] = useKeyboardControls<Controls>()
  
  // Manual keyboard tracking for more reliable movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true
        
        // Start the game on first movement
        if (!isRunning) {
          setIsRunning(true)
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = false
      }
    }
    
    // Handle focus/blur events to prevent stuck keys
    const handleBlur = () => {
      keysPressed.current = {}
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isRunning, setIsRunning])
  
  // Timer
  useFrame((_, delta) => {
    if (isRunning && !isPaused) {
      setTime(time + delta)
    }
  })
  
  // Check if a position is inside a wall
  const isWall = (x: number, z: number) => {
    // Convert world coordinates to maze grid coordinates
    const gridX = Math.floor(x + MAZE_LAYOUT[0].length / 2)
    const gridZ = Math.floor(z + MAZE_LAYOUT.length / 2)
    
    // Check bounds
    if (gridX < 0 || gridX >= MAZE_LAYOUT[0].length || gridZ < 0 || gridZ >= MAZE_LAYOUT.length) {
      return true
    }
    
    // Check if the cell is a wall
    return MAZE_LAYOUT[gridZ][gridX] === 1
  }
  
  // Check for collision with walls
  const checkCollision = (position: THREE.Vector3, radius: number) => {
    // Check collision at multiple points around the player
    const collisionPoints = [
      new THREE.Vector3(position.x + radius, position.y, position.z),
      new THREE.Vector3(position.x - radius, position.y, position.z),
      new THREE.Vector3(position.x, position.y, position.z + radius),
      new THREE.Vector3(position.x, position.y, position.z - radius),
      new THREE.Vector3(position.x + radius * 0.7, position.y, position.z + radius * 0.7),
      new THREE.Vector3(position.x + radius * 0.7, position.y, position.z - radius * 0.7),
      new THREE.Vector3(position.x - radius * 0.7, position.y, position.z + radius * 0.7),
      new THREE.Vector3(position.x - radius * 0.7, position.y, position.z - radius * 0.7)
    ]
    
    for (const point of collisionPoints) {
      if (isWall(point.x, point.z)) {
        return true
      }
    }
    
    return false
  }
  
  // Check if player has reached the exit
  const checkExit = (position: THREE.Vector3) => {
    // Convert world coordinates to maze grid coordinates
    const gridX = Math.floor(position.x + MAZE_LAYOUT[0].length / 2)
    const gridZ = Math.floor(position.z + MAZE_LAYOUT.length / 2)
    
    // Check bounds
    if (gridX < 0 || gridX >= MAZE_LAYOUT[0].length || gridZ < 0 || gridZ >= MAZE_LAYOUT.length) {
      return false
    }
    
    // Check if the cell is the exit
    return MAZE_LAYOUT[gridZ][gridX] === 3
  }
  
  // Play footstep sound
  const playFootstep = () => {
    footstepTimeRef.current += 1
    if (footstepTimeRef.current > 15) {
      // In a real implementation, we would play a sound here
      footstepTimeRef.current = 0
    }
  }
  
  // Player movement
  useFrame((_, delta) => {
    if (isPaused || !playerRef.current) return
    
    // Get movement input from both systems for redundancy
    const { forward, backward, left, right } = getKeys()
    const keys = keysPressed.current
    
    // Combine both input systems for maximum reliability
    const isForward = forward || keys['w'] || keys['arrowup']
    const isBackward = backward || keys['s'] || keys['arrowdown']
    const isLeft = left || keys['a'] || keys['arrowleft']
    const isRight = right || keys['d'] || keys['arrowright']
    
    const isMoving = isForward || isBackward || isLeft || isRight
    
    if (isMoving) {
      playFootstep()
    }
    
    // Calculate movement direction
    const speed = 5
    const velocity = velocityRef.current
    
    // Reset velocity
    velocity.x = 0
    velocity.z = 0
    
    // Get camera direction
    const direction = directionRef.current
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    
    // Calculate forward/backward movement
    if (isForward) {
      velocity.add(direction.clone().multiplyScalar(speed * delta))
    }
    if (isBackward) {
      velocity.add(direction.clone().multiplyScalar(-speed * delta))
    }
    
    // Calculate left/right movement (perpendicular to camera direction)
    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(camera.up, direction).normalize()
    
    if (isLeft) {
      velocity.add(rightVector.clone().multiplyScalar(-speed * delta))
    }
    if (isRight) {
      velocity.add(rightVector.clone().multiplyScalar(speed * delta))
    }
    
    // Apply movement to camera with collision detection
    const newPosition = playerRef.current.position.clone().add(velocity)
    const collisionRadius = 0.3
    
    if (!checkCollision(newPosition, collisionRadius)) {
      playerRef.current.position.copy(newPosition)
      camera.position.copy(playerRef.current.position)
      camera.position.y = 1.6 // Eye height
      
      // Check for checkpoint collisions
      checkpoints.forEach((checkpoint, index) => {
        if (!checkpoint.reached) {
          const distance = playerRef.current!.position.distanceTo(
            new THREE.Vector3(...checkpoint.position)
          )
          
          if (distance < 0.7) {
            const updatedCheckpoints = [...checkpoints]
            updatedCheckpoints[index].reached = true
            setCheckpoints(updatedCheckpoints)
            setCurrentCheckpoint(currentCheckpoint + 1)
          }
        }
      })
      
      // Check if player reached the exit
      if (checkExit(playerRef.current.position)) {
        // Check if all checkpoints have been collected
        const allCheckpointsReached = checkpoints.every(cp => cp.reached)
        
        if (allCheckpointsReached) {
          // Trigger victory
          onVictory()
        }
      }
    }
  })
  
  // Find start position
  const startPosition = (() => {
    for (let z = 0; z < MAZE_LAYOUT.length; z++) {
      for (let x = 0; x < MAZE_LAYOUT[z].length; x++) {
        if (MAZE_LAYOUT[z][x] === 2) {
          return [x - MAZE_LAYOUT[0].length / 2, 0, z - MAZE_LAYOUT.length / 2]
        }
      }
    }
    return [0, 0, 0]
  })()
  
  return (
    <group ref={playerRef} position={new THREE.Vector3(...startPosition)}>
      {/* Player collision body - invisible */}
      <mesh visible={false}>
        <cylinderGeometry args={[0.3, 0.3, 1.6, 8]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  )
}