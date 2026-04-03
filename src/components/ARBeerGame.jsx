import { useEffect, useRef } from "react"
import * as THREE from "three"
import { ARButton } from "three/examples/jsm/webxr/ARButton"
// import vcup from "../assets/textures/vcup.png"
import vlogo from "../assets/textures/vlogo.png"


export default function ARBeerGame() {
  const containerRef = useRef(null)


  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true


    containerRef.current.appendChild(renderer.domElement)
    containerRef.current.appendChild(ARButton.createButton(renderer))


    // LIGHT
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(2, 4, 2)
    scene.add(dirLight)


    // TEXTURE LOADING
    // const loader = new THREE.TextureLoader()
    // const cupTexture = loader.load(vcup)
    // cupTexture.colorSpace = THREE.SRGBColorSpace
    // cupTexture.wrapS = THREE.RepeatWrapping
    // cupTexture.wrapT = THREE.ClampToEdgeWrapping
    // cupTexture.repeat.set(1, 1.2)


    // TABLE
    const tableGroup = new THREE.Group()
    scene.add(tableGroup)
    const table = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 3), new THREE.MeshStandardMaterial({ color: 0x6b3e26 }))
    tableGroup.add(table)


    function triggerCelebration(position) {
      // TEXT
      const textGeo = new THREE.PlaneGeometry(0.4, 0.15)
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 256


      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "gold"
      ctx.font = "bold 80px Arial"
      ctx.textAlign = "center"
      ctx.fillText("YOU WIN!", 256, 150)


      const textTex = new THREE.CanvasTexture(canvas)


      const textMat = new THREE.MeshBasicMaterial({
        map: textTex,
        transparent: true
      })


      const textMesh = new THREE.Mesh(textGeo, textMat)
      textMesh.position.copy(position).add(new THREE.Vector3(0, 0.3, 0))
      scene.add(textMesh)


      // PARTICLES
      const particles = []
      const particleGeo = new THREE.SphereGeometry(0.01, 6, 6)


      for (let i = 0; i < 30; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff
        })


        const p = new THREE.Mesh(particleGeo, mat)
        p.position.copy(position)


        p.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        )


        scene.add(p)
        particles.push(p)
      }


      let t = 0
      const interval = setInterval(() => {
        t += 0.016
        particles.forEach(p => {
          p.velocity.y -= 0.05
          p.position.add(p.velocity.clone().multiplyScalar(0.016))
        })


        if (t > 2) {
          particles.forEach(p => scene.remove(p))
          scene.remove(textMesh)
          clearInterval(interval)
        }
      }, 16)
    }


    // CUPS
    const cups = []
    const cupGeo = new THREE.CylinderGeometry(
      0.05,
      0.035,
      0.12,
      32,
      1,
      true
    )
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xcc0000
    })
    const cupRowCount = 3
    const cupSpacingX = 0.15
    const cupSpacingZ = 0.15
    const logoTexture = new THREE.TextureLoader().load(vlogo)
    logoTexture.colorSpace = THREE.SRGBColorSpace
    for (let i = 0; i < 6; i++) {
      const cup = new THREE.Mesh(cupGeo, cupMat)


      // INNER CUP 
      const innerGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.115, 32, 1, true)
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.BackSide
      })
      const innerCup = new THREE.Mesh(innerGeo, innerMat)
      cup.add(innerCup)


      // LOGO MATERIAL
      const logoMat = new THREE.MeshStandardMaterial({
        map: logoTexture,
        transparent: true,
        roughness: 0.6,
        metalness: 0
      })


      const logoGeo = new THREE.PlaneGeometry(0.08, 0.1)


      // FRONT LOGO
      const frontLogo = new THREE.Mesh(logoGeo, logoMat)
      frontLogo.position.set(0, 0, 0.051)
      cup.add(frontLogo)
      frontLogo.rotation.y = 0.05


      // BACK LOGO
      const backLogo = new THREE.Mesh(logoGeo, logoMat)
      backLogo.position.set(0, 0, -0.051)
      backLogo.rotation.y = Math.PI
      cup.add(backLogo)
      backLogo.rotation.y = Math.PI + 0.05


      // POSITIONING
      const row = Math.floor(i / cupRowCount)
      const col = i % cupRowCount


      cup.position.set(
        (col - 1) * cupSpacingX,
        0.06,
        0.5 - row * cupSpacingZ - 0.15
      )


      table.add(cup)
      cups.push(cup)
    }


    // PLACE TABLE
    renderer.xr.addEventListener("sessionstart", () => {
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      tableGroup.position.copy(camera.position).add(dir.multiplyScalar(1.5))
      tableGroup.position.y -= 0.4
    })


    let hasWon = false


    // BALL
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshStandardMaterial({ color: "orange" }))
    scene.add(ball)
    let isThrown = false
    let aimOffsetX = 0
    let isCharging = false
    let chargeStart = 0
    let power = 0


    function resetBall() { isThrown = false }


    // HORIZONTAL BEER FILL GAUGE
    const gaugeGroup = new THREE.Group()
    const gaugeWidth = 0.25
    const gaugeHeight = 0.03
    const gaugeDepth = 0.01


    // BACKGROUND
    const gaugeBg = new THREE.Mesh(
      new THREE.BoxGeometry(gaugeWidth, gaugeHeight, gaugeDepth),
      new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.6 })
    )
    gaugeGroup.add(gaugeBg)


    // FILL
    const gaugeFill = new THREE.Mesh(
      new THREE.BoxGeometry(gaugeWidth, gaugeHeight, gaugeDepth * 1.1),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    )
    // start at left
    gaugeFill.position.x = -gaugeWidth / 2
    gaugeGroup.add(gaugeFill)


    // position in front of camera
    gaugeGroup.position.set(0, -0.2, -0.5)
    camera.add(gaugeGroup)
    scene.add(camera)


    // THROW
    function startCharge() {
      if (isThrown) return
      isCharging = true
      chargeStart = performance.now()
      power = 0
    }


    function releaseThrow() {
      if (!isCharging || isThrown) return
      isCharging = false


      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()


      const right = new THREE.Vector3()
      camera.getWorldDirection(right).cross(camera.up)


      const throwDir = forward.clone().add(right.multiplyScalar(aimOffsetX)).normalize()
      throwDir.y = 0.35
      throwDir.normalize()


      const speed = (3 + power) * THREE.MathUtils.randFloat(0.85, 1.15)
      ball.velocity = throwDir.multiplyScalar(speed)
      isThrown = true
      aimOffsetX = 0
    }


    // XR CONTROLLER
    const controller = renderer.xr.getController(0)
    scene.add(controller)
    controller.addEventListener("selectstart", startCharge)
    controller.addEventListener("selectend", releaseThrow)


    // SWIPE AIM
    let touchStartX = null
    renderer.domElement.addEventListener("touchstart", e => { if (isCharging) touchStartX = e.touches[0].clientX })
    renderer.domElement.addEventListener("touchmove", e => {
      if (!isCharging || touchStartX === null) return
      aimOffsetX = THREE.MathUtils.clamp((e.touches[0].clientX - touchStartX) / window.innerWidth * 1.5, -0.6, 0.6)
    })
    renderer.domElement.addEventListener("touchend", () => { touchStartX = null })


    // LOOP
    const clock = new THREE.Clock()
    renderer.setAnimationLoop(() => {
      const dt = clock.getDelta()


      // GAUGE FILL LOGIC (horizontal, resets at max)
      if (isCharging) {
        const fillSpeed = 0.6
        power += fillSpeed * dt * 2.5 // fill gradually
        if (power > 2.5) {
          power = 0 // reset after max
          chargeStart = performance.now()
        }


        const pct = THREE.MathUtils.clamp(power / 2.5, 0, 1)
        gaugeFill.scale.x = pct
        gaugeFill.position.x = -gaugeWidth / 2 + (pct * gaugeWidth) / 2
      } else {
        power = 0
        gaugeFill.scale.x = 0
        gaugeFill.position.x = -gaugeWidth / 2
      }


      // BALL FOLLOW CAMERA
      if (!isThrown) {
        const dir = new THREE.Vector3()
        camera.getWorldDirection(dir)
        ball.position.copy(camera.position).add(dir.multiplyScalar(0.5))
        ball.position.y -= 0.1
        const minY = tableGroup.position.y + 0.05 + 0.04
        if (ball.position.y < minY) ball.position.y = minY
      }


      // BALL PHYSICS
      if (isThrown) {
        ball.velocity.y -= 4 * dt
        ball.position.add(ball.velocity.clone().multiplyScalar(dt))
        ball.rotation.x += 10 * dt
        ball.rotation.y += 10 * dt


        const tableTopY = tableGroup.position.y + 0.025
        if (
          ball.position.y <= tableTopY &&
          ball.velocity.y < 0 &&
          ball.position.z < tableGroup.position.z + 1.5 &&
          ball.position.z > tableGroup.position.z - 1.5 &&
          ball.position.x < tableGroup.position.x + 0.5 &&
          ball.position.x > tableGroup.position.x - 0.5
        ) {
          ball.position.y = tableTopY
          ball.velocity.y *= -0.6
          ball.velocity.x *= 0.9
          ball.velocity.z *= 0.9
          if (Math.abs(ball.velocity.y) < 0.1) ball.velocity.y = 0
        }


        cups.forEach((cup, ci) => {
          const cupPos = cup.getWorldPosition(new THREE.Vector3())
          if (ball.position.distanceTo(cupPos) < 0.12) {
            table.remove(cup)
            const bubble = new THREE.Mesh(
              new THREE.SphereGeometry(0.03, 8, 8),
              new THREE.MeshStandardMaterial({ color: "yellow", transparent: true, opacity: 0.7 })
            )
            bubble.position.copy(cupPos)
            scene.add(bubble)
            setTimeout(() => scene.remove(bubble), 1000)
            cups.splice(ci, 1)
            if (cups.length === 0 && !hasWon) {
              hasWon = true
              triggerCelebration(cupPos)
            }
            resetBall()
          }
        })


        if (ball.position.y < -2 || (ball.position.y === tableTopY && ball.velocity.length() < 0.1)) resetBall()
      }


      renderer.render(scene, camera)
    })


    // RESIZE
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })


    return () => renderer.dispose()
  }, [])


  return <div ref={containerRef}></div>
}
