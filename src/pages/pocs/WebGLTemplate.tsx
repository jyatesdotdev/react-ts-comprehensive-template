import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

const CanvasContainer = styled.div.attrs({
  className: 'w-full h-[600px] bg-black rounded-2xl overflow-hidden relative shadow-2xl group'
})``

const HUD = styled.div.attrs({
  className: 'absolute top-6 left-6 flex flex-col gap-2 pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity duration-500'
})``

const Badge = styled.div.attrs({
  className: 'bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20'
})``

const InfoPanel = styled.div.attrs({
  className: 'bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl text-white min-w-[200px] shadow-2xl'
})``

const ControlsTip = styled.div.attrs({
  className: 'absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white/80 font-bold uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'
})``

/**
 * WebGL POC Template
 * 
 * A robust starting point for Three.js experiments.
 * Features:
 * - Full-featured scene setup
 * - Responsive canvas
 * - OrbitControls for camera manipulation
 * - Clean disposal to prevent memory leaks
 */
export default function WebGLTemplate() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)
    
    // Camera
    const aspect = container.clientWidth / container.clientHeight
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
    camera.position.set(5, 5, 8)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x0066ff, 100)
    pointLight.position.set(2, 3, 4)
    scene.add(pointLight)

    const secondaryLight = new THREE.PointLight(0xff0066, 100)
    secondaryLight.position.set(-3, -2, -1)
    scene.add(secondaryLight)

    // Add a helper grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x111111)
    scene.add(gridHelper)

    // Default object: A wireframe sphere
    const geometry = new THREE.SphereGeometry(2.5, 32, 32)
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      shininess: 100
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      // Update controls
      controls.update()

      // Simple animation
      sphere.rotation.y += 0.002
      sphere.rotation.x += 0.001
      
      renderer.render(scene, camera)
    }

    animate()

    // Handle Resize
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      controls.dispose()
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <POCLayout 
      title="WebGL Template" 
      subtitle="Robust Three.js setup with lighting, controls, and safe disposal."
      badge="Template"
      badgeType="Template"
    >
      <CanvasContainer ref={containerRef}>
        <HUD>
          <Badge>WebGL Engine Ready</Badge>
          <InfoPanel>
            <h4 className="font-black text-xs uppercase tracking-tighter opacity-50 mb-1">Active Scene</h4>
            <p className="font-bold">Three.js R174</p>
            <div className="h-px bg-white/10 my-2" />
            <h4 className="font-black text-xs uppercase tracking-tighter opacity-50 mb-1">Navigation</h4>
            <p className="text-[11px] text-white/80">OrbitControls: Enabled</p>
            <p className="text-[11px] text-white/80">Safe Disposal: Active</p>
          </InfoPanel>
        </HUD>
        <ControlsTip>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</ControlsTip>
      </CanvasContainer>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Quick Start</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            This template is a production-ready starting point for high-performance 3D graphics in React. 
            It avoids the overhead of <code>react-three-fiber</code> while maintaining a clean React lifecycle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="font-bold text-blue-600 block mb-1 text-sm">Lifecycle Management</span>
              <span className="text-[11px] text-gray-500">Includes automatic cleanup of geometries, materials, and renderers to prevent memory leaks in SPAs.</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <span className="font-bold text-purple-600 block mb-1 text-sm">OrbitControls</span>
              <span className="text-[11px] text-gray-500">Pre-configured camera controls with damping for smooth user interactions.</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-200">
          <h4 className="font-bold text-lg mb-2">Edit This Scene</h4>
          <p className="text-xs text-blue-100 mb-4 opacity-90 leading-relaxed">
            Modify <code>src/pages/pocs/WebGLTemplate.tsx</code> to start your experiment.
          </p>
          <div className="bg-black/20 p-4 rounded-lg font-mono text-[10px] space-y-2 text-blue-50">
            <p className="opacity-60">// Add geometry here</p>
            <p>const box = new THREE.BoxGeometry()</p>
            <p className="opacity-60">// Add to scene</p>
            <p>scene.add(new THREE.Mesh(box, material))</p>
          </div>
        </div>
      </div>
    </POCLayout>
  )
}
