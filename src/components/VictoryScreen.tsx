
import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useGame } from '../context/GameContext'

interface VictoryScreenProps {
  onRestart: () => void
  onMainMenu: () => void
}

export function VictoryScreen({ onRestart, onMainMenu }: VictoryScreenProps) {
  const { camera } = useThree()
  const { time } = useGame()
  
  // Format time as MM:SS.mmm
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 1000)
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }
  
  // Position the menu in front of the camera
  const menuPosition = [0, 0, -1]
  
  return (
    <group position={menuPosition}>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.15}
        color="#ffcc00"
        anchorX="center"
        anchorY="middle"
        renderOrder={1000}
        depthTest={false}
      >
        VICTORY!
      </Text>
      
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={1000}
        depthTest={false}
      >
        {`Your Time: ${formatTime(time)}`}
      </Text>
      
      <group position={[0, -0.1, 0]}>
        <mesh 
          position={[0, 0, -0.01]} 
          onClick={onRestart}
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
          Play Again
        </Text>
      </group>
      
      <group position={[0, -0.25, 0]}>
        <mesh 
          position={[0, 0, -0.01]} 
          onClick={onMainMenu}
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
          Main Menu
        </Text>
      </group>
    </group>
  )
}