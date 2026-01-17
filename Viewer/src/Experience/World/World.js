import * as THREE from 'three'
import Experience from '../Experience.js'
import Room360 from './Room360.js'
import Hotspot from './Hotspot.js'
import Raycaster from '../Utils/Raycaster.js'
import RoomTransition from '../Utils/RoomTransition.js'

/**
 * World - Gère tout le tour 360°
 * 
 * Charge les rooms, gère les hotspots, transitions entre pièces
 */
export default class World {
    constructor(tourConfig) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.tourConfig = tourConfig  // ← Config reçue depuis Experience

        // État actuel
        this.currentRoom = null
        this.currentHotspots = []
        this.rooms = {}  // Cache des rooms créées

        // Raycaster pour les clics
        this.raycaster = new Raycaster()
        this.roomTransition = new RoomTransition()

        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('World 360')
        }

        console.log("World 360 initialized")

        // Écouter les clics sur les hotspots
        window.addEventListener('hotspotClicked', (event) => {
            this.onHotspotClicked(event.detail)
        })

        // ✅ Charger le tour maintenant (les textures sont déjà preload via Resources)
        this.setupTour()
    }

    /**
     * Setup du tour - Charger la première room
     */
    setupTour() {
        // Trouver la room de départ
        const startRoomData = this.tourConfig.rooms.find(r => r.is_start)
        
        if(!startRoomData) {
            console.error('❌ Pas de room de départ définie')
            return
        }
        
        console.log('🚪 Chargement de la room de départ:', startRoomData.name)
        
        // Créer la room de départ (texture déjà chargée via Resources)
        this.currentRoom = new Room360(
            `room_${startRoomData.id}`,  // ← Nom de la texture dans Resources
            startRoomData                 // ← Données complètes de la room
        )
        
        // Stocker la référence
        this.rooms[startRoomData.id] = this.currentRoom
        
        // Créer les hotspots de cette room
        this.createHotspots(startRoomData.hotspots)
        
        console.log('✅ Tour chargé:', this.tourConfig.tour.name)
    }

    /**
     * Créer les hotspots d'une room
     */
    createHotspots(hotspotsData) {
        // Nettoyer les anciens hotspots
        this.clearHotspots()

        // Si pas de hotspots, ne rien faire
        if(!hotspotsData || hotspotsData.length === 0) {
            console.log('ℹ️ Pas de hotspots dans cette room')
            return
        }

        // Créer les nouveaux hotspots
        hotspotsData.forEach(hotspotData => {
            const hotspot = new Hotspot(hotspotData)
            this.currentHotspots.push(hotspot)
            
            // Ajouter au raycaster pour détecter les clics
            this.raycaster.addIntersectable(hotspot.sprite)
        })

        console.log(`✅ ${hotspotsData.length} hotspots créés`)
    }

    /**
     * Naviguer vers une room (avec transition)
     */
    navigateToRoom(roomId) {
        console.log('🚪 Navigation vers room:', roomId)
        
        // Trouver les données de la room cible
        const targetRoomData = this.tourConfig.rooms.find(r => r.id === roomId)
        
        if(!targetRoomData) {
            console.error('❌ Room introuvable:', roomId)
            return
        }
        
        // Créer la nouvelle room si elle n'existe pas encore
        if(!this.rooms[roomId]) {
            this.rooms[roomId] = new Room360(
                `room_${roomId}`,     // ← Nom texture dans Resources
                targetRoomData        // ← Données de la room
            )
        }
        
        // Récupérer les rooms pour la transition
        const oldRoom = this.currentRoom
        const newRoom = this.rooms[roomId]
        
        // Nettoyer les hotspots avant la transition
        this.clearHotspots()
        
        // Lancer la transition
        this.roomTransition.transition(oldRoom, newRoom, () => {
            // Callback après transition
            
            // Détruire l'ancienne room pour libérer la mémoire
            oldRoom.destroy()
            delete this.rooms[oldRoom.roomData.id]
            
            // Mettre à jour la room actuelle
            this.currentRoom = newRoom
            
            // Créer les hotspots de la nouvelle room
            this.createHotspots(targetRoomData.hotspots)
            
            console.log('✅ Room chargée:', targetRoomData.name)
        })
    }

    /**
     * Gérer le clic sur un hotspot
     */
    onHotspotClicked(detail) {
        console.log('🎯 Hotspot cliqué, detail complet:', detail)
        console.log('🎯 target_room_id:', detail.target_room_id)
        console.log('🎯 Rooms disponibles:', this.tourConfig.rooms.map(r => r.id))
        
        // Naviguer vers la room cible
        this.navigateToRoom(detail.target_room_id)
    }

    /**
     * Nettoyer les hotspots actuels
     */
    clearHotspots() {
        this.currentHotspots.forEach(hotspot => {
            this.raycaster.removeIntersectable(hotspot.sprite)
            hotspot.destroy()
        })
        this.currentHotspots = []
    }

    /**
     * Mettre à jour les hotspots (animation)
     */
    update() {
        // Animer chaque hotspot
        this.currentHotspots.forEach(hotspot => {
            hotspot.update()
        })
    }

    /**
     * Nettoyer tout
     */
    destroy() {
        // Détruire toutes les rooms en cache
        Object.values(this.rooms).forEach(room => room.destroy())
        this.rooms = {}
        
        this.currentRoom = null
        this.clearHotspots()
        this.raycaster.destroy()
        
        window.removeEventListener('hotspotClicked', this.onHotspotClicked)
    }
}