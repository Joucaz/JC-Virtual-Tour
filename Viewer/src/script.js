import './style.css'
import Experience from './Experience/Experience.js'

// Créer l'experience sur le canvas
const canvas = document.querySelector('canvas.webgl')

// Si pas de canvas dans le HTML, on le crée
if(!canvas) {
    const newCanvas = document.createElement('canvas')
    newCanvas.className = 'webgl'
    document.getElementById('canvas-container').appendChild(newCanvas)
    
    const experience = new Experience(newCanvas)
} else {
    const experience = new Experience(canvas)
}