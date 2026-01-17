import * as THREE from 'three'
import Experience from '../Experience.js'

/**
 * Hotspot - Point cliquable dans la scène 360°
 * 
 * Utilise un Sprite (toujours face à la caméra)
 * Permet de naviguer entre les rooms
 */
export default class Hotspot {
    constructor(hotspotData) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.time = this.experience.time
        
        // Données du hotspot
        this.data = hotspotData
        this.position = new THREE.Vector3(
            hotspotData.position.x,
            hotspotData.position.y,
            hotspotData.position.z
        )
        
        this.isHovered = false
        this.baseScale = 1
        this.targetScale = 1
        
        this.createHotspot()
    }

    /**
     * Créer le sprite du hotspot
     */
    createHotspot() {
        // 1. Créer un canvas pour dessiner le hotspot
        const canvas = document.createElement('canvas')
        const size = 128
        canvas.width = size
        canvas.height = size
        
        const context = canvas.getContext('2d')
        
        // 2. Dessiner un cercle avec un anneau (style moderne)
        context.clearRect(0, 0, size, size)
        
        // Cercle extérieur (anneau)
        context.beginPath()
        context.arc(size/2, size/2, size/2 - 10, 0, Math.PI * 2)
        context.strokeStyle = '#ffffff'
        context.lineWidth = 4
        context.stroke()
        
        // Cercle intérieur
        context.beginPath()
        context.arc(size/2, size/2, size/4, 0, Math.PI * 2)
        context.fillStyle = '#ffffff'
        context.fill()
        
        // Optionnel : Ajouter une flèche
        context.fillStyle = '#000000'
        context.font = 'bold 40px Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('→', size/2, size/2)
        
        // 3. Créer la texture depuis le canvas
        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        
        // 4. Créer le matériau sprite
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            depthTest: false  // Toujours visible devant tout
        })
        
        // 5. Créer le sprite
        this.sprite = new THREE.Sprite(material)
        this.sprite.position.copy(this.position)
        this.sprite.scale.set(20, 20, 1)  // Taille du sprite
        
        // Stocker les données pour le raycasting
        this.sprite.userData = {
            type: 'hotspot',
            target_room_id: this.data.target_room_id,  // ← Utiliser target_room_id
            label: this.data.label,
            hotspotInstance: this
        }
        
        // 6. Ajouter à la scène
        this.scene.add(this.sprite)
    }

    /**
     * Animation de hover (scale up)
     */
    onHover() {
        if(!this.isHovered) {
            this.isHovered = true
            this.targetScale = 1.3
            document.body.style.cursor = 'pointer'
        }
    }

    /**
     * Animation de hover out (scale down)
     */
    onHoverOut() {
        if(this.isHovered) {
            this.isHovered = false
            this.targetScale = 1
            document.body.style.cursor = 'default'
        }
    }

    /**
     * Animation de pulse (effet vivant)
     */
    pulse() {
        const elapsed = this.time.elapsed * 0.001
        const pulseScale = 1 + Math.sin(elapsed * 2) * 0.1
        this.sprite.material.opacity = 0.7 + Math.sin(elapsed * 2) * 0.2
    }

    /**
     * Mettre à jour l'animation
     */
    update() {
        // Lerp smooth pour le scale
        this.baseScale += (this.targetScale - this.baseScale) * 0.1
        this.sprite.scale.set(
            20 * this.baseScale,
            20 * this.baseScale,
            1
        )
        
        // Animation pulse si pas hover
        if(!this.isHovered) {
            this.pulse()
        }
    }

    /**
     * Détruire le hotspot
     */
    destroy() {
        this.scene.remove(this.sprite)
        
        if(this.sprite.material.map) {
            this.sprite.material.map.dispose()
        }
        
        this.sprite.material.dispose()
        this.sprite.geometry.dispose()
    }
}