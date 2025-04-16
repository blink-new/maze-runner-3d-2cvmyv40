
import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
  const activeKeysRef = useRef<Set<string>>(new Set())
  const [debugInfo, setDebugInfo] = useState("")
  
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
  
  // Direct keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      
      // Only handle movement keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault() // Prevent default browser behavior
        activeKeysRef.current.add(key)
        
        // Start the game on first movement
        if (!isRunning) {
          setIsRunning(true)
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault() // Prevent default browser behavior
        activeKeysRef.current.delete(key)
      }
    }
    
    // Clear keys when window loses focus
    const handleBlur = () => {
      activeKeysRef.current.clear()
    }
    
    // Add event listeners with capture phase to ensure they're processed first
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('blur', handleBlur)
    
    // Debug info update
    const debugInterval = setInterval(() => {
      if (playerRef.current) {
        const pos = playerRef.current.position
        const keys = Array.from(activeKeysRef.current).join(', ')
        setDebugInfo(`Pos: ${pos.x.toFixed(2)}, ${pos.z.toFixed(2)} | Keys: ${keys}`)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('blur', handleBlur)
      clearInterval(debugInterval)
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
  
  // Player movement - completely rewritten
  useFrame((_, delta) => {
    if (isPaused || !playerRef.current) return
    
    // Get active keys
    const keys = activeKeysRef.current
    const isForward = keys.has('w') || keys.has('arrowup')
    const isBackward = keys.has('s') || keys.has('arrowdown')
    const isLeft = keys.has('a') || keys.has('arrowleft')
    const isRight = keys.has('d') || keys.has('arrowright')
    
    const isMoving = isForward || isBackward || isLeft || isRight
    
    if (isMoving) {
      playFootstep()
    }
    
    // Movement speed
    const speed = 3
    
    // Get camera direction for forward/backward movement
    const direction = directionRef.current
    camera.getWorldDirection(direction)
    direction.y = 0 // Keep movement on the horizontal plane
    direction.normalize()
    
    // Get perpendicular direction for left/right movement
    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(camera.up, direction).normalize()
    
    // Calculate movement vector
    const moveVector = new THREE.Vector3(0, 0, 0)
    
    if (isForward) moveVector.add(direction)
    if (isBackward) moveVector.sub(direction)
    if (isRight) moveVector.add(rightVector)
    if (isLeft) moveVector.sub(rightVector)
    
    // Normalize and scale by speed and delta time
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta)
    }
    
    // Apply movement with collision detection
    if (moveVector.length() > 0) {
      const newPosition = playerRef.current.position.clone().add(moveVector)
      const collisionRadius = 0.3
      
      if (!checkCollision(newPosition, collisionRadius)) {
        // Update player position
        playerRef.current.position.copy(newPosition)
        
        // Update camera position to follow player
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
      
      {/* Debug info */}
      {isRunning && (
        <group position={[0, -0.6, -0.5]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1, 0.2]} />
            <meshBasicMaterial color="black" transparent opacity={0.7} />
          </mesh>
          <sprite scale={[1, 0.2, 1]} position={[0, 0, 0.01]}>
            <spriteMaterial>
              <canvasTexture attach="map" args={[(() => {
                const canvas = document.createElement('canvas')
                canvas.width = 256
                canvas.height = 64
                const ctx = canvas.getContext('2d')!
                ctx.fillStyle = 'white'
                ctx.font = '16px monospace'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(debugInfo, 128, 32)
                return canvas
              })()]} />
            </spriteMaterial>
          </sprite>
        </group>
      )}
    </group>
  )
}