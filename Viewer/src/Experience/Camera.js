import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.aspectRatioCamera = this.sizes.width / this.sizes.height

        this.baseFOV = 75;
        
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Camera')
        }

        this.setInstance()

        this.enableControls = true

        if(this.enableControls)
            this.setControls()

    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(this.baseFOV, this.aspectRatioCamera, 0.1, 1000)
        this.instance.position.set(0.1, 0, 0)

        // DON'T WORK WITH ORBIT CONTROLS
        // this.instance.lookAt(new THREE.Vector3(0, 0, 0))

        this.scene.add(this.instance)
        
        // if(this.debug.active)
        // {
        //     this.debugFolder
        //         .add(this.instance, 'fov')
        //         .name('FOV')
        //         .min(40)
        //         .max(100)
        //         .step(1)
        //         .onChange((value) => {
        //             this.instance.fov = value; // on met à jour le FOV
        //             this.instance.updateProjectionMatrix(); // obligatoire pour appliquer le changement
        //         });
            
        //     this.debugFolder
        //         .add(this.instance.position, 'x')
        //         .name('Position X')
        //         .min(-10)
        //         .max(10)
        //         .step(0.01)
        //     this.debugFolder
        //         .add(this.instance.position, 'y')
        //         .name('Position Y')
        //         .min(-10)
        //         .max(10)
        //         .step(0.01)
        //     this.debugFolder
        //         .add(this.instance.position, 'z')
        //         .name('Position Z')
        //         .min(-10)
        //         .max(10)
        //         .step(0.1)
        // }
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        
        // Configuration pour visite 360°
        this.controls.enableDamping = true      // Animation fluide
        this.controls.dampingFactor = 0.05      // Vitesse de l'inertie
        this.controls.enableZoom = false        // Pas de zoom (on reste au centre)
        this.controls.enablePan = false         // Pas de déplacement latéral
        this.controls.rotateSpeed = -0.5        // Vitesse de rotation (négatif = inverser)
        
        // Limites verticales (empêcher de voir le sol/plafond à 90°)
        // this.controls.minPolarAngle = Math.PI * 0.1   // 18° du haut
        // this.controls.maxPolarAngle = Math.PI * 0.9   // 18° du bas
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height        
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        
        // const elapsedTime = this.clock.getElapsedTime()
        // const deltaTime = elapsedTime - this.previousTime
        // this.previousTime = elapsedTime

        // const parallaxAmplitude = 0.02
        // const parallaxX = this.experience.cursor.x * parallaxAmplitude
        // const parallaxY = -this.experience.cursor.y * parallaxAmplitude
        // this.instance.position.x += (parallaxX - this.instance.position.x) * 5 * deltaTime
        // this.instance.position.y += (parallaxY - this.instance.position.y) * 5 * deltaTime

        if(this.enableControls)
            this.controls.update()
    }

    destroy() {
        this.controls.dispose()
    }
}