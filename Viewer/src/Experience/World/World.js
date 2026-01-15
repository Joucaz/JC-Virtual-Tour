import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import UnlimitedTexture from './UnlimitedTexture.js'
import Model3D from './Model3D.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('World')
        }

        console.log("wrold");
        

        // Wait for resources
        this.resources.on('ready', () =>
        {            

            console.log("ready");
            
            this.unlimitedTexture = new UnlimitedTexture()

            this.model3D = new Model3D()

            // Setup Environment
            this.environment = new Environment()
        })

    }

    update()
    {        
        if(this.model3D)
            this.model3D.update()
        if(this.environment)
            this.environment.update()
    }
}