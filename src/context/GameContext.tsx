
import { createContext, useContext, useState, ReactNode } from 'react'

interface Checkpoint {
  position: [number, number, number]
  reached: boolean
}

interface GameContextType {
  time: number
  setTime: (time: number) => void
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  isPaused: boolean
  setIsPaused: (isPaused: boolean) => void
  checkpoints: Checkpoint[]
  setCheckpoints: (checkpoints: Checkpoint[]) => void
  currentCheckpoint: number
  setCurrentCheckpoint: (checkpoint: number) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0)

  const resetGame = () => {
    setTime(0)
    setIsRunning(false)
    setIsPaused(false)
    setCurrentCheckpoint(0)
    setCheckpoints(checkpoints.map(cp => ({ ...cp, reached: false })))
  }

  return (
    <GameContext.Provider
      value={{
        time,
        setTime,
        isRunning,
        setIsRunning,
        isPaused,
        setIsPaused,
        checkpoints,
        setCheckpoints,
        currentCheckpoint,
        setCurrentCheckpoint,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}