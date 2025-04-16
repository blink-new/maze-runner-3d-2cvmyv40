
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

export function Player() {
  const { camera } = useThree()
  const playerRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const directionRef = useRef(new THREE.Vector3())
  const { 
    isRunning, 
    setIsRunning, 
    isPaused, 
    time, 
    setTime, 
    checkpoints, 
    setCheckpoints,
    currentCheckpoint,
    setCurrentCheckpoint
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
  
  // Player movement
  useFrame((_, delta) => {
    if (isPaused) return
    
    const { forward, backward, left, right } = getKeys()
    
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
    
    // Apply movement to camera
    if (playerRef.current) {
      // Simple collision detection with walls
      const newPosition = playerRef.current.position.clone().add(velocity)
      
      // Check for collisions (simplified)
      const collisionRadius = 0.4
      const hasCollision = false // Implement proper collision detection here
      
      if (!hasCollision) {
        playerRef.current.position.add(velocity)
        camera.position.copy(playerRef.current.position)
        camera.position.y = 1.6 // Eye height
      }
      
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
            setCurrentCheckpoint(index + 1)
          }
        }
      })
    }
  })
  
  return (
    <group ref={playerRef} position={[1, 0, 1]}>
      {/* Player collision body - invisible */}
      <mesh visible={false}>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  )
}