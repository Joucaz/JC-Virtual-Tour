import * as THREE from 'three'
import Experience from '../Experience.js'

export default class UnlimitedTexture
{
    constructor()
    {
        
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('UnlimitedTextures')
        }

        this.textures = {}

        this.setTexture()

        this.setMaterials()
    }

    setTexture()
    {
        this.textures.color = this.resources.items.baseTexture
        this.textures.color.colorSpace = THREE.SRGBColorSpace
        this.textures.color.flipY = false
    }

    setMaterials()
    {
        this.bakedMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.color,
        })
    }
}