import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug


        this.debugObject = {}

        this.intensityAmbientLight = 0.2
        this.intensityAmbientLightOff = 0
        this.intensityDirectionnalLight = 3.5
        this.intensityDirectionnalLightOff = 0
        
        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }

        this.setLights()
        
        // this.setEnvironmentMap()
    }

    setLights()
    {
        // Ambient Light (0xffffff, 0.2)
        this.ambientLight = new THREE.AmbientLight(0xffffff, this.intensityAmbientLight)
        this.scene.add(this.ambientLight)

        // Directional Light (0xffffff, 3)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, this.intensityDirectionnalLight)
        this.directionalLight.castShadow = true
        // this.directionalLight.shadow.mapSize.set(1024, 1024)
        // this.directionalLight.shadow.camera.far = 15
        // this.directionalLight.shadow.camera.left = - 7
        // this.directionalLight.shadow.camera.top = 7
        // this.directionalLight.shadow.camera.right = 7
        // this.directionalLight.shadow.camera.bottom = - 7
        this.directionalLight.position.set(5, 5, 5)
        this.scene.add(this.directionalLight)
    }

    
    setEnvironmentMap()
    {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.4
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
        
        this.scene.environment = this.environmentMap.texture

        this.environmentMap.updateMaterials = () =>
        {
            this.scene.traverse((child) =>
            {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
                {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }
        this.environmentMap.updateMaterials()

        // Debug
        if(this.debug.active)
        {
            this.debugFolder
                .add(this.environmentMap, 'intensity')
                .name('envMapIntensity')
                .min(0)
                .max(4)
                .step(0.001)
                .onChange(this.environmentMap.updateMaterials)
        }
    }

    update()
    {
         
    }
}