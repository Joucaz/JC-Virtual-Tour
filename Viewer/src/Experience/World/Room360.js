import * as THREE from 'three'
import Experience from '../Experience.js'

/**
 * Room360 - Représente une pièce en 360°
 * 
 * Technique :
 * - Sphère géante avec texture 360° à l'intérieur
 * - On inverse les normales (scale -1) pour voir l'intérieur
 * - La caméra est au centre de cette sphère
 */
export default class Room360 {
    constructor(textureName, roomData = {}) {  // ← textureName au lieu de imageUrl
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources  // ← Accès aux resources
        this.debug = this.experience.debug
        
        this.textureName = textureName  // ← Nom dans Resources (ex: "room_abc123")
        this.roomData = roomData
        this.isLoaded = true  // ← Toujours true car texture déjà chargée
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Room360')
        }
        
        this.createRoom()
    }

    /**
     * Créer la sphère 360°
     */
    createRoom() {
        // 1. Créer la géométrie (sphère de rayon 500)
        this.geometry = new THREE.SphereGeometry(
            500,    // Rayon - assez grand pour envelopper la caméra
            60,     // Segments horizontaux (qualité) - plus = plus lisse
            40      // Segments verticaux (qualité)
        )
        
        // 2. IMPORTANT : Inverser la sphère pour voir l'intérieur
        this.geometry.scale(-1, 1, 1)

        // 3. ✅ Récupérer la texture DÉJÀ CHARGÉE depuis Resources
        this.texture = this.resources.items[this.textureName]
        
        if(!this.texture) {
            console.error('❌ Texture introuvable dans Resources:', this.textureName)
            return
        }
        
        console.log('✅ Texture récupérée depuis Resources:', this.textureName)

        // 4. Configuration de la texture (au cas où pas déjà fait)
        this.texture.colorSpace = THREE.SRGBColorSpace
        this.texture.minFilter = THREE.LinearFilter
        this.texture.magFilter = THREE.LinearFilter

        // 5. Créer le matériau
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.FrontSide
        })

        // 6. Créer le mesh final
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = 'Room360_' + (this.roomData.name || 'default')
        
        // 7. Ajouter à la scène
        this.scene.add(this.mesh)
        
        // Debug
        if(this.debug.active) {
            this.debugFolder
                .add(this.mesh.rotation, 'y')
                .name('Rotation Y')
                .min(-Math.PI)
                .max(Math.PI)
                .step(0.01)
        }
    }

    /**
     * Changer la texture de la room (maintenant INSTANTANÉ!)
     * @param {string} newTextureName - Nom de la texture dans Resources
     * @param {Function} onComplete - Callback optionnel
     */
    changeTexture(newTextureName, onComplete = null) {
        // Récupérer la texture déjà chargée
        const newTexture = this.resources.items[newTextureName]
        
        if(!newTexture) {
            console.error('❌ Texture introuvable dans Resources:', newTextureName)
            return
        }

        // Configuration
        newTexture.colorSpace = THREE.SRGBColorSpace
        newTexture.minFilter = THREE.LinearFilter
        newTexture.magFilter = THREE.LinearFilter
        
        // ⚠️ Ne PAS dispose l'ancienne texture (Resources la gère)
        
        // Remplacer la texture
        this.texture = newTexture
        this.material.map = newTexture
        this.material.needsUpdate = true
        
        this.textureName = newTextureName
        
        console.log('✅ Room changée instantanément vers:', newTextureName)
        
        // Appeler le callback immédiatement (pas d'async)
        if(onComplete) onComplete()
    }

    /**
     * Détruire la room (libérer mémoire)
     */
    destroy() {
        // Retirer de la scène
        this.scene.remove(this.mesh)
        
        // Libérer la géométrie
        if(this.geometry) {
            this.geometry.dispose()
        }
        
        // Libérer le matériau
        if(this.material) {
            this.material.dispose()
        }
        
        // ⚠️ Ne PAS dispose la texture ici, Resources s'en occupe
        
        console.log('🗑️ Room360 détruite')
    }
}