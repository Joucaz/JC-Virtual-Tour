import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.rendererFolder = this.debug.ui.addFolder('Renderer')
        }

        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        })
        // this.instance.toneMapping = THREE.NoToneMapping
        // this.instance.toneMapping = THREE.CineonToneMapping
        // this.instance.toneMappingExposure = 1.75
        // this.instance.shadowMap.enabled = true
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.setClearColor('#211d20')
        this.instance.setClearColor('#000000')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.autoUpdate = false
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    }

    update()
    {    
        this.instance.render(this.scene, this.camera.instance)
    }

    destroy() {
        this.instance.dispose()
    }
}