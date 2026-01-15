import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Model3D
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('model')
        }

        // Resource
        this.resource = this.resources.items.model3D

        this.setModel()
        this.setAnimation()
    } 

    setModel()
    {        
        this.model = this.resource.scene
        this.scene.add(this.model)
        console.log(this.model);
        

        this.model.traverse(child => {

            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                
                if (child.material)
                    child.material = this.experience.world.unlimitedTexture.bakedMaterial

            }
        });

    }


    setAnimation()
    {
        this.animation = {}
                
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}        
        
        this.animation.actions.chairAction = this.animation.mixer.clipAction(this.resource.animations[0])

        this.playAnimation()
        
    }

    playAnimation()
    {
        const action = this.animation.actions.chairAction;

        action.reset();      
        action.setLoop(THREE.LoopRepeat);
        // action.clampWhenFinished = true;   
        action.play();   
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)     
    }
}