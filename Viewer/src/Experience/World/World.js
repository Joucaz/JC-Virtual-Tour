import * as THREE from 'three'
import Experience from '../Experience.js'
import Room360 from './Room360.js'
import Hotspot from './Hotspot.js'
import Raycaster from '../Utils/Raycaster.js'

/**
 * World - Gère tout le tour 360°
 * 
 * Charge les rooms, gère les hotspots, transitions entre pièces
 */
export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // État actuel
        this.currentRoom = null
        this.currentHotspots = []
        
        // Données du tour (sera chargé depuis API plus tard)
        this.tourData = null
        
        // Raycaster pour les clics
        this.raycaster = new Raycaster()

        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('World 360')
        }

        console.log("World 360 initialized")

        // Écouter les clics sur les hotspots
        window.addEventListener('hotspotClicked', (event) => {
            this.onHotspotClicked(event.detail)
        })

        // Pour l'instant, on charge des données de test
        // Plus tard, on fera : this.loadTourFromAPI(clientSlug, tourSlug)
        this.loadTestTour()
    }

    /**
     * Charger un tour de test (sans API)
     * À REMPLACER plus tard par loadTourFromAPI()
     */
    loadTestTour() {
        // Données hardcodées pour tester
        this.tourData = {
            name: "Tour Demo",
            rooms: [
                {
                    id: "salon",
                    name: "Salon",
                    imageUrl: "/assets/tour-demo/church.jpg",  // Tu devras mettre tes images ici
                    isStart: true,
                    hotspots: [
                        {
                            id: "h1",
                            position: { x: 200, y: 0, z: -400 },
                            targetRoom: "chambre",
                            label: "Chambre"
                        }
                    ]
                },
                {
                    id: "chambre",
                    name: "Chambre",
                    imageUrl: "/assets/tour-demo/warm_bar.jpg",
                    isStart: false,
                    hotspots: [
                        {
                            id: "h2",
                            position: { x: -200, y: 0, z: 400 },
                            targetRoom: "salon",
                            label: "Retour Salon"
                        },
                        {
                            id: "h3",
                            position: { x: 300, y: -50, z: 200 },
                            targetRoom: "cuisine",
                            label: "Cuisine"
                        }
                    ]
                },
                {
                    id: "cuisine",
                    name: "Cuisine",
                    imageUrl: "/assets/tour-demo/warm_restaurant_night.jpg",
                    isStart: false,
                    hotspots: [
                        {
                            id: "h4",
                            position: { x: 0, y: 0, z: 500 },
                            targetRoom: "chambre",
                            label: "Retour Chambre"
                        }
                    ]
                }
            ]
        }

        // Charger la première room
        const startRoom = this.tourData.rooms.find(r => r.isStart)
        if(startRoom) {
            this.loadRoom(startRoom.id)
        }
    }

    /**
     * FUTURE : Charger depuis l'API
     * À implémenter dans l'étape 4 (Backend)
     */
    async loadTourFromAPI(clientSlug, tourSlug) {
        try {
            const response = await fetch(`/api/tour/${clientSlug}/${tourSlug}`)
            
            // Vérifier si suspendu
            if(response.status === 403) {
                this.showSuspendedMessage()
                return
            }
            
            const data = await response.json()
            this.tourData = data
            
            // Charger la première room
            const startRoom = this.tourData.rooms.find(r => r.isStart)
            if(startRoom) {
                this.loadRoom(startRoom.id)
            }
            
        } catch(error) {
            console.error('❌ Erreur chargement tour:', error)
        }
    }

    /**
     * Afficher message si client suspendu
     */
    showSuspendedMessage() {
        const loader = document.getElementById('loader')
        const suspendedMsg = document.getElementById('suspended-message')
        
        if(loader) loader.style.display = 'none'
        if(suspendedMsg) suspendedMsg.style.display = 'block'
    }

    /**
     * Charger une room par son ID
     */
    loadRoom(roomId) {
        console.log('🚪 Chargement de la room:', roomId)

        // Trouver les données de la room
        const roomData = this.tourData.rooms.find(r => r.id === roomId)
        
        if(!roomData) {
            console.error('❌ Room introuvable:', roomId)
            return
        }

        // 1. Nettoyer l'ancienne room si elle existe
        if(this.currentRoom) {
            this.clearCurrentRoom()
        }

        // 2. Créer la nouvelle room 360°
        this.currentRoom = new Room360(roomData.imageUrl, roomData)

        // 3. Créer les hotspots de cette room
        this.createHotspots(roomData.hotspots)

        console.log('✅ Room chargée:', roomData.name)
    }

    /**
     * Créer les hotspots d'une room
     */
    createHotspots(hotspotsData) {
        // Nettoyer les anciens hotspots
        this.clearHotspots()

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
     * Nettoyer la room actuelle
     */
    clearCurrentRoom() {
        if(this.currentRoom) {
            this.currentRoom.destroy()
            this.currentRoom = null
        }
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
     * Gérer le clic sur un hotspot
     */
    onHotspotClicked(detail) {
        console.log('🎯 Navigation vers:', detail.targetRoom)
        
        // Transition (fade optionnel - simple version)
        this.loadRoom(detail.targetRoom)
        
        // TODO: Ajouter une vraie transition (fade, zoom, etc.)
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
        this.clearCurrentRoom()
        this.clearHotspots()
        this.raycaster.destroy()
        
        window.removeEventListener('hotspotClicked', this.onHotspotClicked)
    }
}