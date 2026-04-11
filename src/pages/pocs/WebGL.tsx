import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

const CanvasContainer = styled.div.attrs({
  className: 'w-full h-[500px] bg-black rounded-2xl overflow-hidden relative shadow-inner'
})``

const InfoOverlay = styled.div.attrs({
  className: 'absolute top-4 left-4 bg-white/10 backdrop-blur-md p-4 rounded-lg text-white pointer-events-none'
})``

export default function WebGLPOC() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16)
    const material = new THREE.MeshNormalMaterial()
    const torusKnot = new THREE.Mesh(geometry, material)
    scene.add(torusKnot)

    camera.position.z = 30

    const animate = () => {
      requestAnimationFrame(animate)
      torusKnot.rotation.x += 0.01
      torusKnot.rotation.y += 0.01
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <POCLayout 
      title="WebGL Graphics" 
      subtitle="Experimental 3D rendering with Three.js in React."
      badge="WIP"
      badgeType="WIP"
    >
      <CanvasContainer ref={containerRef}>
        <InfoOverlay>
          <h3 className="font-bold">Three.js Scene</h3>
          <p className="text-sm opacity-80">Rotating TorusKnotGeometry</p>
        </InfoOverlay>
      </CanvasContainer>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
          <h3 className="font-bold text-lg mb-4 text-blue-900">Why Three.js?</h3>
          <p className="text-gray-700">Three.js is the industry standard for 3D on the web. It abstracts the complexities of raw WebGL while remaining highly performant.</p>
        </div>
        <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
          <h3 className="font-bold text-lg mb-4 text-purple-900">Integration Tips</h3>
          <p className="text-gray-700">Always clean up your renderer and event listeners in the <code>useEffect</code> return function. For a more declarative approach in React, consider using <code>react-three-fiber</code>.</p>
        </div>
      </div>
    </POCLayout>
  )
}
