import * as THREE from 'three'
import Experience from "../Experience";

export default class Input
{
    constructor() {
        this.experience = new Experience();

        // const actions = {
        //     'ArrowRight': () => window.location.href = '/portfolio',
        //     'ArrowLeft': () => window.location.href = '/profile/en',
        //     'KeyR': () => this.experience.world.reyna.playAnimation(),
        // };

        // document.addEventListener('keydown', (event) => {
        //     if (actions[event.code]) actions[event.code]();
        // });

    }
}