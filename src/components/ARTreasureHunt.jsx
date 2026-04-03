import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { ARButton } from "three/examples/jsm/webxr/ARButton"

export default function TreasureHunt() {
  const containerRef = useRef(null)
  const [scoreUI, setScoreUI] = useState(0)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true

    containerRef.current.appendChild(renderer.domElement)
    
    // Simplified ARButton just like BeerPong
    const arButton = ARButton.createButton(renderer)
    containerRef.current.appendChild(arButton)

    // LIGHTING
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(2, 4, 2)
    scene.add(dirLight)

    // GAME STATE
    let items = []
    let score = 0
    const MAX_ITEMS = 5

    // ITEM CONFIGURATION
    const RARITY = {
      COMMON: { color: 0xaaaaaa, points: 10 },
      RARE: { color: 0x4da6ff, points: 50 },
      EPIC: { color: 0xcc66ff, points: 150 },
      LEGENDARY: { color: 0xffcc00, points: 400 }
    }

    const ITEMS = [
      { type: "cap", rarity: "COMMON" },
      { type: "mug", rarity: "RARE" },
      { type: "barrel", rarity: "EPIC" }
    ]

    const createCap = (color) => new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32), new THREE.MeshStandardMaterial({ color }))
    const createMug = (color) => {
      const group = new THREE.Group()
      group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 32), new THREE.MeshStandardMaterial({ color })))
      return group
    }
    const createBarrel = (color) => new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32), new THREE.MeshStandardMaterial({ color }))

    function spawnItem() {
      if (items.length >= MAX_ITEMS) return
      const itemData = ITEMS[Math.floor(Math.random() * ITEMS.length)]
      const rarityData = RARITY[itemData.rarity]
      let mesh = itemData.type === "cap" ? createCap(rarityData.color) : itemData.type === "mug" ? createMug(rarityData.color) : createBarrel(rarityData.color)

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      mesh.position.copy(camera.position).add(direction.multiplyScalar(2 + Math.random() * 2))
      
      const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
      mesh.position.add(right.multiplyScalar((Math.random() - 0.5) * 2))
      mesh.position.y += Math.random() * 1.5
      mesh.userData = { points: rarityData.points, baseY: mesh.position.y }

      scene.add(mesh)
      items.push(mesh)
    }

    let spawnTimer
    renderer.xr.addEventListener("sessionstart", () => {
      spawnTimer = setInterval(spawnItem, 3000)
    })

    // TAP TO COLLECT
    const onTap = () => {
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      let closest = null
      let minAngle = 0.2

      items.forEach((item) => {
        const toItem = new THREE.Vector3().subVectors(item.position, camera.position).normalize()
        const angle = direction.angleTo(toItem)
        if (angle < minAngle) { minAngle = angle; closest = item }
      })

      if (closest) {
        score += closest.userData.points
        setScoreUI(score)
        scene.remove(closest)
        items = items.filter((i) => i !== closest)
      }
    }
    window.addEventListener("click", onTap)

    // ANIMATION LOOP
    renderer.setAnimationLoop(() => {
      items.forEach((item) => {
        item.rotation.y += 0.01
        item.position.y = item.userData.baseY + Math.sin(Date.now() * 0.002) * 0.1
      })
      renderer.render(scene, camera)
    })

    // RESIZE
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", onResize)

    // CLEANUP
    return () => {
      window.removeEventListener("click", onTap)
      window.removeEventListener("resize", onResize)
      clearInterval(spawnTimer)
      renderer.setAnimationLoop(null)
      renderer.dispose()
      if (arButton && arButton.parentNode) {
        arButton.parentNode.removeChild(arButton)
      }
    }
  }, [])

  return (
    <div style={{ width: "100%", height: "100vh" }} ref={containerRef}>
      <div style={{
        position: "fixed", top: 15, left: 15, color: "white", zIndex: 9999,
        fontSize: 20, fontWeight: "bold", background: "rgba(0,0,0,0.6)", padding: "10px 14px", borderRadius: 10, pointerEvents: "none"
      }}>
        Score: {scoreUI}
      </div>
    </div>
  )
}