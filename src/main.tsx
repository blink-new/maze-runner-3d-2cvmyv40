
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { KeyboardControls } from '@react-three/drei'
import App from './App'
import './index.css'

// Define keyboard controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <KeyboardControls
    map={[
      { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
      { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
      { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
      { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
      { name: Controls.jump, keys: ['Space'] },
    ]}
  >
    <Toaster position="top-right" />
    <App />
  </KeyboardControls>
)