import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function Map({ setScreen }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 12, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)

    // LIGHT
    const light = new THREE.DirectionalLight(0xffffff, 1.2)
    light.position.set(10, 20, 10)
    light.castShadow = true
    scene.add(light)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    // SMALLER BASE
    const SIZE = 14

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(SIZE, SIZE),
      new THREE.MeshStandardMaterial({ color: 0xeaeaea })
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    const grid = new THREE.GridHelper(SIZE, 10)
    scene.add(grid)

    // ZONES DATA
    const zones = [
      { name: "🎵 Stage", color: 0xff4d4d },
      { name: "🍺 Beer", color: 0xffcc00 },
      { name: "🍔 Food", color: 0x4caf50 },
      { name: "🎉 Party", color: 0x9c27b0 },
      { name: "🚻 WC", color: 0x2196f3 },
      { name: "🚪 Exit", color: 0x607d8b }
    ]

    const zoneMeshes = []

    // GRID PLACEMENT (NO OVERLAP)
    const gridPositions = []
    const step = 4

    for (let x = -SIZE / 2 + 2; x < SIZE / 2; x += step) {
      for (let z = -SIZE / 2 + 2; z < SIZE / 2; z += step) {
        gridPositions.push({ x, z })
      }
    }

    // shuffle positions
    gridPositions.sort(() => Math.random() - 0.5)

    zones.forEach((z, i) => {
      const pos = gridPositions[i]

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.5, 2.5),
        new THREE.MeshStandardMaterial({ color: z.color })
      )

      mesh.position.set(pos.x, 0.25, pos.z)
      scene.add(mesh)
      zoneMeshes.push(mesh)

      // LABEL (canvas texture)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = 256
      canvas.height = 128

      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "black"
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText(z.name, canvas.width / 2, 70)

      const texture = new THREE.CanvasTexture(canvas)

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture })
      )

      sprite.scale.set(3, 1.5, 1)
      sprite.position.set(pos.x, 1.5, pos.z)

      scene.add(sprite)
    })

    // STICK FIGURE
    const stick = new THREE.Group()

    const material = new THREE.MeshStandardMaterial({ color: 0x000000 })

    // head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25), material)
    head.position.y = 1.2
    stick.add(head)

    // body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8), material)
    body.position.y = 0.6
    stick.add(body)

    // legs
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), material)
    leg1.position.set(-0.15, 0.2, 0)
    leg1.rotation.z = 0.2

    const leg2 = leg1.clone()
    leg2.position.x = 0.15
    leg2.rotation.z = -0.2

    stick.add(leg1, leg2)

    // arms
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), material)
    arm1.position.set(-0.35, 0.8, 0)
    arm1.rotation.z = 0.5

    const arm2 = arm1.clone()
    arm2.position.x = 0.35
    arm2.rotation.z = -0.5

    stick.add(arm1, arm2)

    stick.position.set(0, 0, 0)
    scene.add(stick)

    // MOVEMENT
    setInterval(() => {
      stick.position.x += (Math.random() - 0.5) * 2
      stick.position.z += (Math.random() - 0.5) * 2

      stick.position.x = Math.max(-6, Math.min(6, stick.position.x))
      stick.position.z = Math.max(-6, Math.min(6, stick.position.z))
    }, 2000)

    // TOUCH ROTATION
    let isDragging = false
    let lastX = 0
    let velocity = 0

    const onTouchStart = (e) => {
      isDragging = true
      lastX = e.touches[0].clientX
    }

    const onTouchMove = (e) => {
      if (!isDragging) return

      const currentX = e.touches[0].clientX
      const delta = currentX - lastX

      velocity = delta * 0.003
      scene.rotation.y += velocity

      lastX = currentX
    }

    const onTouchEnd = () => {
      isDragging = false
    }

    renderer.domElement.addEventListener("touchstart", onTouchStart)
    renderer.domElement.addEventListener("touchmove", onTouchMove)
    renderer.domElement.addEventListener("touchend", onTouchEnd)

    // LOOP
    const animate = () => {
      requestAnimationFrame(animate)

      if (!isDragging) {
        scene.rotation.y += velocity
        velocity *= 0.95
      }

      zoneMeshes.forEach((z, i) => {
        z.position.y = 0.25 + Math.sin(Date.now() * 0.002 + i) * 0.1
      })

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      mountRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div>
      <div ref={mountRef} />

      <button
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px",
          zIndex: 10
        }}
        onClick={() => setScreen("home")}
      >
        BACK
      </button>
    </div>
  )
}