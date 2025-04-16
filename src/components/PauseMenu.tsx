
import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useGame} from '../context/GameContext'

interface PauseMenuProps {
  onResume: () => void
}

export function PauseMenu({ onResume }: PauseMenuProps) {
  const { camera } = useThree()
  const { resetGame } = useGame()
  
  // Position the menu in front of the camera
  const menuPosition = [0, 0, -1]
  
  const handleResume = () => {
    onResume()
  }
  
  const handleReset = () => {
    resetGame()
    onResume()
  }
  
  return (
    <group position={menuPosition}>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={1000}
        depthTest={false}
      >
        PAUSED
      </Text>
      
      <group position={[0, 0, 0]}>
        <mesh 
          position={[0, 0, -0.01]} 
          onClick={handleResume}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <planeGeometry args={[0.6, 0.1]} />
          <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
          depthTest={false}
        >
          Resume
        </Text>
      </group>
      
      <group position={[0, -0.15, 0]}>
        <mesh 
          position={[0, 0, -0.01]} 
          onClick={handleReset}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <planeGeometry args={[0.6, 0.1]} />
          <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
          depthTest={false}
        >
          Reset
        </Text>
      </group>
    </group>
  )
}