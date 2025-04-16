
import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { useGame } from '../context/GameContext'

export function HUD() {
  const { time, isRunning, checkpoints, currentCheckpoint } = useGame()
  const { camera } = useThree()
  const [formattedTime, setFormattedTime] = useState('00:00.000')
  
  // Format time as MM:SS.mmm
  useEffect(() => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 1000)
    
    setFormattedTime(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
    )
  }, [time])
  
  return (
    <>
      {/* Timer */}
      <group position={[0, 0.3, -0.5]} rotation={[0, 0, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
          depthTest={false}
          font="/fonts/Inter-Bold.woff"
        >
          {isRunning ? formattedTime : '00:00.000'}
        </Text>
      </group>
      
      {/* Checkpoint counter */}
      <group position={[0, 0.2, -0.5]} rotation={[0, 0, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.03}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
          depthTest={false}
          font="/fonts/Inter-Regular.woff"
        >
          {`Checkpoints: ${currentCheckpoint}/${checkpoints.length}`}
        </Text>
      </group>
      
      {/* Compass/Direction indicator */}
      <group position={[0, 0.1, -0.5]} rotation={[0, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.03, 0.035, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
        <mesh rotation={[0, 0, Math.PI * 0.5]}>
          <boxGeometry args={[0.01, 0.04, 0.001]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>
      
      {/* Controls reminder */}
      <Html
        position={[0, -0.4, -0.5]}
        transform
        occlude
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
          fontFamily: 'monospace'
        }}
      >
        <div>
          <div>WASD - Move</div>
          <div>MOUSE - Look</div>
          <div>ESC - Pause</div>
        </div>
      </Html>
    </>
  )
}