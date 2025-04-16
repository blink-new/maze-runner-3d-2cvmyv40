
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'
import { 
  createStoneTexture, 
  createFloorTexture, 
  createCheckpointTexture, 
  createExitTexture 
} from '../utils/textureLoader'

// Define the maze layout
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

export function Maze() {
  const { setCheckpoints } = useGame()
  
  // Create procedural textures
  const stoneTexture = useMemo(() => createStoneTexture(), [])
  const floorTexture = useMemo(() => createFloorTexture(), [])
  const checkpointTexture = useMemo(() => createCheckpointTexture(), [])
  const exitTexture = useMemo(() => createExitTexture(), [])
  
  // Find checkpoints and set them in context
  useEffect(() => {
    const checkpointPositions: { position: [number, number, number], reached: boolean }[] = []
    
    MAZE_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 4) {
          checkpointPositions.push({
            position: [colIndex - MAZE_LAYOUT[0].length / 2, 0.5, rowIndex - MAZE_LAYOUT.length / 2],
            reached: false
          })
        }
      })
    })
    
    setCheckpoints(checkpointPositions)
  }, [setCheckpoints])
  
  // Find start position
  const startPosition = useMemo(() => {
    for (let z = 0; z < MAZE_LAYOUT.length; z++) {
      for (let x = 0; x < MAZE_LAYOUT[z].length; x++) {
        if (MAZE_LAYOUT[z][x] === 2) {
          return [x - MAZE_LAYOUT[0].length / 2, 0, z - MAZE_LAYOUT.length / 2]
        }
      }
    }
    return [0, 0, 0]
  }, [])
  
  // Find end position
  const endPosition = useMemo(() => {
    for (let z = 0; z < MAZE_LAYOUT.length; z++) {
      for (let x = 0; x < MAZE_LAYOUT[z].length; x++) {
        if (MAZE_LAYOUT[z][x] === 3) {
          return [x - MAZE_LAYOUT[0].length / 2, 0, z - MAZE_LAYOUT.length / 2]
        }
      }
    }
    return [0, 0, 0]
  }, [])
  
  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[MAZE_LAYOUT[0].length, MAZE_LAYOUT.length]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>
      
      {/* Ceiling */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 2.5, 0]}
      >
        <planeGeometry args={[MAZE_LAYOUT[0].length, MAZE_LAYOUT.length]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Maze walls */}
      {MAZE_LAYOUT.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          const x = colIndex - MAZE_LAYOUT[0].length / 2
          const z = rowIndex - MAZE_LAYOUT.length / 2
          
          if (cell === 1) {
            return (
              <mesh 
                key={`wall-${rowIndex}-${colIndex}`} 
                position={[x, 1, z]} 
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 2, 1]} />
                <meshStandardMaterial map={stoneTexture} />
              </mesh>
            )
          }
          
          if (cell === 3) {
            return (
              <mesh 
                key={`exit-${rowIndex}-${colIndex}`} 
                position={[x, 0, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial 
                  map={exitTexture} 
                  emissive="#ff4400"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )
          }
          
          if (cell === 4) {
            return (
              <mesh 
                key={`checkpoint-${rowIndex}-${colIndex}`} 
                position={[x, 0, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial 
                  map={checkpointTexture} 
                  emissive="#00ffff"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )
          }
          
          return null
        })
      )}
    </group>
  )
}