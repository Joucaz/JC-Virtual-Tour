import * as THREE from 'three'
import Experience from '../Experience.js'

/**
 * Raycaster - Détecte les clics sur les hotspots
 * 
 * Lance un rayon depuis la caméra à travers la souris
 * Détecte les intersections avec les objets 3D
 */
export default class Raycaster {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        
        // Raycaster Three.js
        this.raycaster = new THREE.Raycaster()
        
        // Position de la souris normalisée (-1 à +1)
        this.mouse = new THREE.Vector2()
        
        // Liste des objets à tester
        this.intersectableObjects = []
        
        // Hotspot actuellement survolé
        this.currentHoveredHotspot = null
        
        this.setupEventListeners()
    }

    /**
     * Configurer les event listeners
     */
    setupEventListeners() {
        // Mouvement de la souris
        window.addEventListener('mousemove', (event) => {
            this.onMouseMove(event)
        })
        
        // Clic de la souris
        window.addEventListener('click', (event) => {
            this.onClick(event)
        })
        
        // Touch pour mobile (optionnel)
        window.addEventListener('touchstart', (event) => {
            // Convertir touch en mouse event
            if(event.touches.length > 0) {
                const touch = event.touches[0]
                this.onMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                })
                this.onClick({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                })
            }
        })
    }

    /**
     * Ajouter un objet à la liste des intersectables
     */
    addIntersectable(object) {
        if(!this.intersectableObjects.includes(object)) {
            this.intersectableObjects.push(object)
        }
    }

    /**
     * Retirer un objet de la liste
     */
    removeIntersectable(object) {
        const index = this.intersectableObjects.indexOf(object)
        if(index !== -1) {
            this.intersectableObjects.splice(index, 1)
        }
    }

    /**
     * Convertir position souris en coordonnées normalisées
     */
    updateMousePosition(event) {
        // Normaliser : 0,0 = top-left → -1,-1 = top-left dans Three.js
        this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1
        this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1
    }

    /**
     * Gérer le mouvement de la souris (hover)
     */
    onMouseMove(event) {
        this.updateMousePosition(event)
        
        // Mettre à jour le raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        
        // Tester les intersections
        const intersects = this.raycaster.intersectObjects(
            this.intersectableObjects,
            false  // recursive = false (pas besoin ici)
        )
        
        // Gérer le hover
        if(intersects.length > 0) {
            const firstIntersect = intersects[0]
            const hotspot = firstIntersect.object.userData.hotspotInstance
            
            // Nouveau hotspot survolé
            if(hotspot && hotspot !== this.currentHoveredHotspot) {
                // Désactiver l'ancien hover
                if(this.currentHoveredHotspot) {
                    this.currentHoveredHotspot.onHoverOut()
                }
                
                // Activer le nouveau hover
                hotspot.onHover()
                this.currentHoveredHotspot = hotspot
            }
        } else {
            // Plus rien de survolé
            if(this.currentHoveredHotspot) {
                this.currentHoveredHotspot.onHoverOut()
                this.currentHoveredHotspot = null
            }
        }
    }

    /**
     * Gérer le clic
     */
    onClick(event) {
        this.updateMousePosition(event)
        
        // Mettre à jour le raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        
        // Tester les intersections
        const intersects = this.raycaster.intersectObjects(
            this.intersectableObjects,
            false
        )
        
        // Si on a cliqué sur un hotspot
        if(intersects.length > 0) {
            const clickedObject = intersects[0].object
            const userData = clickedObject.userData
            
            if(userData.type === 'hotspot') {
                console.log('🎯 Hotspot cliqué:', userData.label)
                
                // Émettre un événement pour que World.js puisse changer de room
                // On utilise un événement custom JavaScript
                window.dispatchEvent(new CustomEvent('hotspotClicked', {
                    detail: {
                        targetRoom: userData.targetRoom,
                        label: userData.label
                    }
                }))
            }
        }
    }

    /**
     * Nettoyer les event listeners
     */
    destroy() {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('click', this.onClick)
        window.removeEventListener('touchstart', this.onMouseMove)
    }
}