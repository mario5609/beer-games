import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { ARButton } from "three/examples/jsm/webxr/ARButton"

export default function TreasureHunt({ setScreen }) {
  const containerRef = useRef(null)
  const [scoreUI, setScoreUI] = useState(0)

  useEffect(() => {
    let scene, camera, renderer
    let items = []
    let score = 0
    const MAX_ITEMS = 5

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    )

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // ✅ ARButton setup (shows camera feed automatically)
    containerRef.current.appendChild(
      ARButton.createButton(renderer, {
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.body }
      })
    )

    // Light
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))

    // Items
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

    const createCap = (color) =>
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32),
        new THREE.MeshStandardMaterial({ color })
      )

    const createMug = (color) => {
      const group = new THREE.Group()
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.25, 32),
        new THREE.MeshStandardMaterial({ color })
      )
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.02, 16, 50),
        new THREE.MeshStandardMaterial({ color })
      )
      handle.rotation.y = Math.PI / 2
      handle.position.x = 0.15
      group.add(body, handle)
      return group
    }

    const createBarrel = (color) =>
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32),
        new THREE.MeshStandardMaterial({ color })
      )

    // Spawn items
    function spawnItem() {
      if (items.length >= MAX_ITEMS) return

      const itemData = ITEMS[Math.floor(Math.random() * ITEMS.length)]
      const rarityData = RARITY[itemData.rarity]
      let mesh =
        itemData.type === "cap"
          ? createCap(rarityData.color)
          : itemData.type === "mug"
          ? createMug(rarityData.color)
          : createBarrel(rarityData.color)

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const distance = 2 + Math.random() * 2
      mesh.position.copy(camera.position)
      mesh.position.add(direction.multiplyScalar(distance))

      const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
      mesh.position.add(right.multiplyScalar((Math.random() - 0.5) * 2))
      mesh.position.y += Math.random() * 1.5

      const scaleMap = { COMMON: 0.8, RARE: 1, EPIC: 1.2, LEGENDARY: 1.5 }
      mesh.scale.setScalar(scaleMap[itemData.rarity])

      mesh.userData = { type: itemData.type, rarity: itemData.rarity, points: rarityData.points, baseY: mesh.position.y }

      scene.add(mesh)
      items.push(mesh)
    }

    function spawnLoop() {
      spawnItem()
      setTimeout(spawnLoop, 3000)
    }

    // Tap-to-collect
    function onTap() {
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
        closest.scale.multiplyScalar(1.3)
        if (closest.material) {
          closest.material.emissive = new THREE.Color(0xffffff)
          closest.material.emissiveIntensity = 2
        }
        setTimeout(() => {
          scene.remove(closest)
          items = items.filter((i) => i !== closest)
        }, 120)
      }
    }

    window.addEventListener("click", onTap)

    // Swipe exit
    let startX = 0
    window.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX))
    window.addEventListener("touchend", (e) => {
      if (e.changedTouches[0].clientX - startX > 100 && renderer.xr.isPresenting) {
        renderer.xr.getSession().end()
      }
    })

    // Animation loop
    renderer.setAnimationLoop(() => {
      items.forEach((item) => {
        item.rotation.y += 0.01
        item.position.y = item.userData.baseY + Math.sin(Date.now() * 0.002) * 0.1
        if (item.material) {
          item.material.emissive = new THREE.Color(item.material.color)
          item.material.emissiveIntensity = 0.4
        }
      })
      renderer.render(scene, camera)
    })

    // Start spawning when AR starts
    renderer.xr.addEventListener("sessionstart", () => spawnLoop())

    // Resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    return () => {
      window.removeEventListener("click", onTap)
      renderer.dispose()
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