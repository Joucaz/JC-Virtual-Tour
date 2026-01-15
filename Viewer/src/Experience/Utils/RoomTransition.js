import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from 'gsap'

/**
 * RoomTransition - Gère les transitions fluides entre rooms
 * 
 * Techniques utilisées :
 * - Crossfade entre deux sphères (opacity)
 * - Zoom léger de la caméra (FOV animation)
 * - Pas d'écran noir, toujours quelque chose à voir
 */
export default class RoomTransition {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        
        this.isTransitioning = false
        this.transitionDuration = 0.3 // secondes
    }

    /**
     * Transition entre deux rooms
     * @param {Room360} oldRoom - Room actuelle
     * @param {Room360} newRoom - Nouvelle room
     * @param {Function} onComplete - Callback quand terminé
     */
    async transition(oldRoom, newRoom, onComplete) {
        if(this.isTransitioning) {
            console.warn('⚠️ Transition déjà en cours')
            return
        }

        this.isTransitioning = true
        
        console.log('🔄 Début transition...')

        // 1. Setup : Rendre la nouvelle room invisible au début
        newRoom.material.opacity = 0
        newRoom.material.transparent = true

        // 2. Rendre l'ancienne room transparente aussi (pour le crossfade)
        oldRoom.material.transparent = true
        oldRoom.material.opacity = 1

        // 3. Timeline GSAP pour orchestrer toutes les animations
        const timeline = gsap.timeline({
            onComplete: () => {
                console.log('✅ Transition terminée')
                
                // Nettoyer : remettre opacité à 1 et transparent à false
                newRoom.material.transparent = false
                newRoom.material.opacity = 1
                
                this.isTransitioning = false
                
                if(onComplete) onComplete()
            }
        })

        // 4. Animation FOV (zoom avant puis arrière = sensation de mouvement)
        const originalFOV = this.camera.instance.fov
        
        timeline
            // Phase 1 : Zoom IN (0.0s → 0.4s)
            .to(this.camera.instance, {
                fov: originalFOV - 20, // Zoom avant
                duration: 0.4,
                ease: 'power2.in',
                onUpdate: () => {
                    this.camera.instance.updateProjectionMatrix()
                }
            })
            
            // Phase 2 : Crossfade des rooms (0.2s → 1.0s) - overlap avec le zoom
            .to(oldRoom.material, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut'
            }, 0.2) // Commence à 0.2s (pendant le zoom in)
            
            .to(newRoom.material, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.inOut'
            }, 0.2) // En même temps que le fade out
            
            // Phase 3 : Zoom OUT (0.8s → 1.2s)
            .to(this.camera.instance, {
                fov: originalFOV, // Retour au FOV normal
                duration: 0.4,
                ease: 'power2.out',
                onUpdate: () => {
                    this.camera.instance.updateProjectionMatrix()
                }
            }, 0.8) // Commence à 0.8s

        return timeline
    }

    /**
     * Transition rapide (pour tests)
     */
    transitionFast(oldRoom, newRoom, onComplete) {
        this.transitionDuration = 0.6
        return this.transition(oldRoom, newRoom, onComplete)
    }

    /**
     * Transition lente/cinématique
     */
    transitionSlow(oldRoom, newRoom, onComplete) {
        this.transitionDuration = 2.0
        return this.transition(oldRoom, newRoom, onComplete)
    }
}