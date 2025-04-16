
import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

export function Loader() {
  const { active, progress } = useProgress()
  const [show, setShow] = useState(true)
  
  useEffect(() => {
    if (!active && progress === 100) {
      const timeout = setTimeout(() => {
        setShow(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [active, progress])
  
  if (!show) return null
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-white font-mono">{progress.toFixed(0)}%</p>
      </div>
    </div>
  )
}