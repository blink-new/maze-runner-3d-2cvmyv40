
import * as THREE from 'three'

// Create procedural textures
export function createStoneTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')!
  
  // Base color
  context.fillStyle = '#555555'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add stone pattern
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = 5 + Math.random() * 15
    const shade = Math.floor(Math.random() * 40)
    
    context.fillStyle = `rgb(${80 - shade}, ${80 - shade}, ${80 - shade})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  
  // Add cracks
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const length = 20 + Math.random() * 100
    const angle = Math.random() * Math.PI * 2
    
    context.strokeStyle = '#333333'
    context.lineWidth = 1 + Math.random() * 2
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    )
    context.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  
  return texture
}

export function createFloorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')!
  
  // Base color
  context.fillStyle = '#333333'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add floor pattern
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = 1 + Math.random() * 2
    const shade = Math.floor(Math.random() * 20)
    
    context.fillStyle = `rgb(${60 - shade}, ${60 - shade}, ${60 - shade})`
    context.fillRect(x, y, size, size)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  
  return texture
}

export function createCheckpointTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  
  // Base color
  context.fillStyle = '#222222'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw checkpoint pattern
  context.fillStyle = '#00ffff'
  
  // Outer circle
  context.beginPath()
  context.arc(128, 128, 100, 0, Math.PI * 2)
  context.stroke()
  
  // Inner circle
  context.beginPath()
  context.arc(128, 128, 80, 0, Math.PI * 2)
  context.fill()
  
  // Center
  context.fillStyle = '#222222'
  context.beginPath()
  context.arc(128, 128, 40, 0, Math.PI * 2)
  context.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

export function createExitTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  
  // Base color
  context.fillStyle = '#222222'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw exit pattern
  context.fillStyle = '#ff4400'
  
  // Exit symbol
  context.beginPath()
  context.moveTo(50, 50)
  context.lineTo(206, 128)
  context.lineTo(50, 206)
  context.closePath()
  context.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}