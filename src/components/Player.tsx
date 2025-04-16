
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

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
  
  // Set up keyboard controls
  const [, getKeys] = useKeyboardControls()
  
  // Start the game when player moves
  useEffect(() => {
    if (!isRunning) {
      const handleFirstMove = () => {
        setIsRunning(true)
      }
      
      window.addEventListener('keydown', handleFirstMove)
      return () => window.removeEventListener('keydown', handleFirstMove)
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
    
    const { forward, backward, left, right } = getKeys()
    const isMoving = forward || backward || left || right
    
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
    if (forward) {
      velocity.add(direction.clone().multiplyScalar(speed * delta))
    }
    if (backward) {
      velocity.add(direction.clone().multiplyScalar(-speed * delta))
    }
    
    // Calculate left/right movement (perpendicular to camera direction)
    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(camera.up, direction).normalize()
    
    if (left) {
      velocity.add(rightVector.clone().multiplyScalar(-speed * delta))
    }
    if (right) {
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