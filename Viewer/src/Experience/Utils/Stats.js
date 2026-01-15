import FPS from 'stats.js'

export default class Stats
{
    constructor()
    {
        this.stats = new FPS()
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom);
        
    }

    update()
    {
        this.stats.begin()
        this.stats.end()
    }
}