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
    constructor(imageUrl, roomData = {}) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        
        this.imageUrl = imageUrl
        this.roomData = roomData
        this.isLoaded = false
        
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
        // console.log('🔵 createRoom appelé avec imageUrl:', this.imageUrl)
        // 1. Créer la géométrie (sphère de rayon 500)
        this.geometry = new THREE.SphereGeometry(
            500,    // Rayon - assez grand pour envelopper la caméra
            60,     // Segments horizontaux (qualité) - plus = plus lisse
            40      // Segments verticaux (qualité)
        )
        
        // 2. IMPORTANT : Inverser la sphère pour voir l'intérieur
        // Normalement une sphère est visible de l'extérieur
        // On inverse sur l'axe X pour la voir de l'intérieur
        this.geometry.scale(-1, 1, 1)

        // 3. Charger la texture 360°
        this.textureLoader = new THREE.TextureLoader()
        this.texture = this.textureLoader.load(
            this.imageUrl,
            
            // Callback de succès - CONFIGURER LA TEXTURE ICI
            (loadedTexture) => {
                console.log('✅ Texture chargée:', this.imageUrl)
                
                // Configuration APRÈS chargement
                loadedTexture.colorSpace = THREE.SRGBColorSpace
                loadedTexture.minFilter = THREE.LinearFilter
                loadedTexture.magFilter = THREE.LinearFilter
                
                this.isLoaded = true
                
                // Cacher le loader HTML
                const loader = document.getElementById('loader')
                if(loader) loader.style.display = 'none'
            },
            
            // Callback de progression (optionnel)
            undefined,
            
            // Callback d'erreur
            (error) => {
                console.error('❌ Erreur chargement texture:', error)
            }
        )

        // 4. Configuration de la texture pour un meilleur rendu
        this.texture.colorSpace = THREE.SRGBColorSpace  // Couleurs correctes (important!)
        this.texture.minFilter = THREE.LinearFilter     // Filtre quand on s'éloigne
        this.texture.magFilter = THREE.LinearFilter     // Filtre quand on s'approche

        // 5. Créer le matériau
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.FrontSide  // On voit l'intérieur (ou DoubleSide)
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
     * Changer la texture de la room (transition entre pièces)
     */
    changeTexture(newImageUrl, onLoad = null) {
        // Fade out progressif (optionnel - on peut faire plus fancy)
        this.material.opacity = 0.5
        
        // Charger la nouvelle texture
        this.textureLoader.load(
            newImageUrl,
            (newTexture) => {
                // Configurer la nouvelle texture
                newTexture.colorSpace = THREE.SRGBColorSpace
                newTexture.minFilter = THREE.LinearFilter
                newTexture.magFilter = THREE.LinearFilter
                
                // Remplacer l'ancienne texture
                if(this.texture) {
                    this.texture.dispose() // IMPORTANT : libérer la mémoire
                }
                
                this.texture = newTexture
                this.material.map = newTexture
                this.material.needsUpdate = true
                this.material.opacity = 1
                
                this.imageUrl = newImageUrl
                
                console.log('✅ Room changée vers:', newImageUrl)
                
                if(onLoad) onLoad()
            },
            undefined,
            (error) => {
                console.error('❌ Erreur changement de room:', error)
            }
        )
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
        
        // Libérer la texture
        if(this.texture) {
            this.texture.dispose()
        }
        
        // Libérer le matériau
        if(this.material) {
            this.material.dispose()
        }
        
        console.log('🗑️ Room360 détruite')
    }
}