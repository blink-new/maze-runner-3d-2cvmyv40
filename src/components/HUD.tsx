
import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
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
      <Text
        position={[0, 0.1, -0.5]}
        fontSize={0.05}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={1000}
        depthTest={false}
        font="/fonts/Inter-Bold.woff"
        characters="0123456789:."
      >
        {isRunning ? formattedTime : '00:00.000'}
      </Text>
      
      {/* Checkpoint counter */}
      <Text
        position={[0, 0.05, -0.5]}
        fontSize={0.03}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={1000}
        depthTest={false}
        font="/fonts/Inter-Regular.woff"
      >
        {`Checkpoints: ${currentCheckpoint}/${checkpoints.length}`}
      </Text>
    </>
  )
}