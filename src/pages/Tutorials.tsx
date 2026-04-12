import { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

// Container ensures the primary layout fills the page.
// Adjusting 'min-h-screen' stretches the wrapper to match the browser height.
const Container = styled.div.attrs({
  className: 'min-h-screen bg-gray-50 flex flex-col items-center font-sans'
})``

// Wrapper coordinates the sidebar and main content layout.
// Adjusting 'flex-col md:flex-row' makes it single-column on mobile and dual-column on larger screens.
const Wrapper = styled.div.attrs({
  className: 'max-w-6xl w-full flex flex-col md:flex-row gap-8 p-8 mt-4'
})``

// Sidebar restrains the left-hand navigation menu.
// Adjusting 'w-full md:w-64' sets full width on mobile devices, and fixed width on desktop.
const Sidebar = styled.aside.attrs({
  className: 'w-full md:w-64 flex-shrink-0 space-y-1'
})``

// SidebarItem represents each selectable tab in the left navigation.
// Modifying 'bg-blue-600 text-white' changes the active state colors.
const SidebarItem = styled.button.attrs<{ $active?: boolean }>(props => ({
  className: `w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
    props.$active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
      : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600'
  }`
}))``

// MainContent holds the active tutorial text.
// Adjusting 'flex-grow min-w-0' guarantees text truncation or wrapping functions correctly within flex children.
const MainContent = styled.main.attrs({
  className: 'flex-grow bg-white shadow-xl rounded-2xl p-8 md:p-12 border border-gray-100 min-w-0'
})``

// DocHeader groups the top-level tutorial title.
// Adjusting 'border-b pb-8' creates the separator beneath the title block.
const DocHeader = styled.div.attrs({
  className: 'mb-10 border-b border-gray-100 pb-8'
})``

// Title is the primary header of a tutorial page.
// Adjusting 'text-4xl font-black' sets the overarching large text style.
const Title = styled.h1.attrs({
  className: 'text-4xl font-black text-gray-900 mb-4 tracking-tight'
})``

// Subtitle provides a brief summary string.
// Adjusting 'text-xl' makes it perceptibly larger than body text but smaller than the heading.
const Subtitle = styled.p.attrs({
  className: 'text-xl text-gray-600'
})``

// Heading2 defines major sections in the documentation.
// Adjusting 'mt-12 mb-6' guarantees comfortable breathing room before a new topic.
const Heading2 = styled.h2.attrs({
  className: 'text-2xl font-bold text-gray-800 mt-12 mb-6 flex items-center gap-2'
})``

// Heading3 frames subsections.
// Adjusting 'text-xl mt-8' visually reduces the hierarchy impact relative to Heading2.
const Heading3 = styled.h3.attrs({
  className: 'text-xl font-bold text-gray-800 mt-8 mb-4'
})``

// Text formats the primary reading paragraphs.
// Adjusting 'leading-relaxed mb-4' ensures lines are spaced out cleanly for reading.
const Text = styled.p.attrs({
  className: 'text-gray-600 leading-relaxed mb-4'
})``

// CodeBlock displays multi-line instructions.
// Adjusting 'bg-gray-900 text-gray-100 overflow-x-auto' ensures dark-mode code doesn't overflow its container sideways.
const CodeBlock = styled.pre.attrs({
  className: 'bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-6 text-sm font-mono leading-relaxed shadow-lg'
})``

// List encapsulates unordered bullets.
// Adjusting 'list-disc list-inside space-y-2' controls the bullet style and vertical gap.
const List = styled.ul.attrs({
  className: 'list-disc list-inside space-y-2 mb-6 text-gray-600'
})``

// ListItem styles a single bullet row.
// Adjusting 'leading-relaxed' aligns bullet spacing with standard Text paragraphs.
const ListItem = styled.li.attrs({
  className: 'leading-relaxed'
})``

// ExternalLink is a distinctly styled hyperlink.
// Adjusting 'flex items-center gap-1 hover:underline' pairs textual links with potential icons reliably.
const ExternalLink = styled.a.attrs({
  className: 'text-blue-600 font-bold hover:underline inline-flex items-center gap-1'
})``

// InlineCode wraps inline technical terminology.
// Adjusting 'bg-gray-100 text-blue-600 px-1.5 rounded' distinguishes the text clearly without breaking paragraph flow.
const InlineCode = styled.code.attrs({
  className: 'bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[0.9em]'
})``

// SectionSeparator applies visual breaks for highly different content blocks.
// Adjusting 'my-12' sets large whitespace padding top and bottom.
const SectionSeparator = styled.hr.attrs({
  className: 'my-12 border-gray-100'
})``

type TutorialTab = 'overview' | 'adding-pocs' | 'backend' | 'testing' | 'webgl' | 'websocket' | 'webrtc' | 'api' | 'todo'

export default function Tutorials() {
  const [activeTab, setActiveTab] = useState<TutorialTab>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <DocHeader>
              <Title>Research Lab Tutorials</Title>
              <Subtitle>Master the environment and accelerate your technical prototyping.</Subtitle>
            </DocHeader>
            <Text>
              Welcome to the documentation for the Research Lab. This environment is built to be the fastest way to test new technologies, patterns, and architectures.
            </Text>
            <Heading2>Core Principles</Heading2>
            <List>
              <ListItem><strong>Modularity</strong>: Every experiment is isolated. Breaking one doesn't break the others.</ListItem>
              <ListItem><strong>Zero Config Backend</strong>: Automated Hono routing means you focus on logic, not boilerplate.</ListItem>
              <ListItem><strong>Ready-to-Go Stack</strong>: Three.js, WebSockets, and WebRTC are pre-configured and waiting for you.</ListItem>
            </List>
            <Text>
              Select a guide from the sidebar to learn how to extend the lab with your own experiments.
            </Text>
          </>
        )
      case 'adding-pocs':
        return (
          <>
            <DocHeader>
              <Title>Adding a New POC</Title>
              <Subtitle>Automated scaffolding or manual integration.</Subtitle>
            </DocHeader>
            <Heading2>1. Automated Scaffolding</Heading2>
            <Text>Use the CLI to generate everything you need in one command.</Text>
            <CodeBlock>{`# Basic UI POC
npm run create-poc "My New Feature"

# Specialized POC (webgl, websocket, webrtc, api, todo)
npm run create-poc "3D Experiment" webgl

# POC with automated backend module generation
npm run create-poc "Data Grid" api --backend`}</CodeBlock>
            
            <Heading2>2. Manual Integration</Heading2>
            <Heading3>Step A: Create the Component</Heading3>
            <Text>Create a file in <InlineCode>src/pages/pocs/MyExperiment.tsx</InlineCode>:</Text>
            <CodeBlock>{`import React from 'react'
import POCLayout from '../../components/POCLayout'

export default function MyExperiment() {
  return (
    <POCLayout title="My Experiment">
      <div>Your code here</div>
    </POCLayout>
  )
}`}</CodeBlock>
            
            <Heading3>Step B: Register Metadata</Heading3>
            <Text>Add your POC to <InlineCode>src/config/pocs.ts</InlineCode>:</Text>
            <CodeBlock>{`{
  id: 'my-experiment',
  name: 'My Experiment',
  path: '/pocs/my-experiment',
  component: React.lazy(() => import('../pages/pocs/MyExperiment')),
  description: 'A brief summary.'
}`}</CodeBlock>
          </>
        )
      case 'backend':
        return (
          <>
            <DocHeader>
              <Title>Backend Integration</Title>
              <Subtitle>Extending the Hono server with custom routes.</Subtitle>
            </DocHeader>
            <Text>The lab uses Hono, a modern and ultra-fast web framework.</Text>
            <Heading2>Creating a Module</Heading2>
            <Text>Create <InlineCode>server/pocs/my-poc.ts</InlineCode>:</Text>
            <CodeBlock>{`import { Hono } from 'hono'
const app = new Hono()

app.get('/data', (c) => c.json({ status: 'ok' }))

export default app`}</CodeBlock>
            
            <Heading2>Mounting Routes</Heading2>
            <Text>Register it in <InlineCode>server/routes.ts</InlineCode>:</Text>
            <CodeBlock>{`import myPoc from './pocs/my-poc'
api.route('/my-poc', myPoc)`}</CodeBlock>
            
            <ExternalLink href="https://hono.dev/docs" target="_blank">View Hono Documentation →</ExternalLink>
          </>
        )
      case 'testing':
        return (
          <>
            <DocHeader>
              <Title>Testing Guide</Title>
              <Subtitle>Unit testing with Vitest and E2E with Playwright.</Subtitle>
            </DocHeader>
            <Heading2>Unit Testing (Vitest)</Heading2>
            <CodeBlock>{`import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
  })
})`}</CodeBlock>
            <Text>Run with <InlineCode>npm run test</InlineCode> or <InlineCode>npm run test:watch</InlineCode>.</Text>
            
            <Heading2>E2E Testing (Playwright)</Heading2>
            <CodeBlock>{`import { test, expect } from '@playwright/test'

test('navigation works', async ({ page }) => {
  await page.goto('/')
  await page.click('text=My POC')
  await expect(page).toHaveURL(/.*my-poc/)
})`}</CodeBlock>
            <Text>Run with <InlineCode>npm run test:e2e</InlineCode>.</Text>
          </>
        )
      case 'webgl':
        return (
          <>
            <DocHeader>
              <Title>WebGL (Three.js)</Title>
              <Subtitle>Building high-performance 3D graphics.</Subtitle>
            </DocHeader>
            <Text>
              The WebGL template provides a memory-safe Three.js environment within the React lifecycle.
            </Text>

            <Heading2>1. Adding New Components</Heading2>
            <Text>To add a new 3D object, create a new geometry and material, then add it to the scene inside the <InlineCode>useEffect</InlineCode> hook.</Text>
            <CodeBlock>{`// Inside useEffect
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// Remember to dispose in cleanup!
return () => {
  geometry.dispose()
  material.dispose()
}`}</CodeBlock>

            <Heading2>2. Backend Integration</Heading2>
            <Text>You can fetch scene configurations or 3D models from the Hono backend.</Text>
            <Heading3>Backend (server/pocs/webgl.ts)</Heading3>
            <CodeBlock>{`import { Hono } from 'hono'
const app = new Hono()

app.get('/config', (c) => c.json({
  sphereColor: '#ff0088',
  rotationSpeed: 0.01
}))

export default app`}</CodeBlock>
            <Heading3>Frontend (src/pages/pocs/WebGL.tsx)</Heading3>
            <CodeBlock>{`useEffect(() => {
  fetch('/api/webgl/config')
    .then(res => res.json())
    .then(config => {
      setSphereColor(config.sphereColor)
    })
}, [])`}</CodeBlock>

            <Heading2>3. Unit Testing</Heading2>
            <Text>Use Vitest to verify the component renders the canvas element correctly.</Text>
            <CodeBlock>{`import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WebGL from './WebGL'

describe('WebGL POC', () => {
  it('renders a canvas element', () => {
    const { container } = render(<WebGL />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })
})`}</CodeBlock>

            <Heading2>4. E2E Testing</Heading2>
            <Text>Use Playwright to take a screenshot and verify the 3D scene is visible.</Text>
            <CodeBlock>{`import { test, expect } from '@playwright/test'

test('WebGL scene renders', async ({ page }) => {
  await page.goto('/pocs/webgl')
  await expect(page.locator('canvas')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/webgl-poc.png' })
})`}</CodeBlock>

            <SectionSeparator />
            <Heading2>Memory Management</Heading2>
            <Text>
              Always dispose of geometries, materials, and textures in the <InlineCode>useEffect</InlineCode> cleanup function to prevent memory leaks.
            </Text>
            <CodeBlock>{`return () => {
  renderer.dispose()
  geometry.dispose()
  material.dispose()
  controls.dispose()
  container.removeChild(renderer.domElement)
}`}</CodeBlock>
            <Heading2>Responsive Design</Heading2>
            <Text>
              Use the provided resize listener to ensure the aspect ratio and renderer size update when the window changes.
            </Text>
            <ExternalLink href="https://threejs.org/docs/" target="_blank">Three.js Documentation →</ExternalLink>
          </>
        )
      case 'websocket':
        return (
          <>
            <DocHeader>
              <Title>WebSocket Guide</Title>
              <Subtitle>Real-time, bi-directional communication.</Subtitle>
            </DocHeader>
            <Text>
              The Hono server is configured with <InlineCode>@hono/node-ws</InlineCode> for standard WebSocket support.
            </Text>
            <Heading2>Frontend Connection</Heading2>
            <CodeBlock>{`const socket = new WebSocket('ws://localhost:5180/ws')
socket.onmessage = (e) => console.log(e.data)`}</CodeBlock>
            <Heading2>Backend Handling</Heading2>
            <Text>
              Modify the handler in <InlineCode>server/index.ts</InlineCode> to add custom message processing logic.
            </Text>
          </>
        )
      case 'webrtc':
        return (
          <>
            <DocHeader>
              <Title>WebRTC Guide</Title>
              <Subtitle>Peer-to-peer audio and video streaming.</Subtitle>
            </DocHeader>
            <Text>
              The WebRTC POC demonstrates a local loopback connection using <InlineCode>RTCPeerConnection</InlineCode>.
            </Text>
            <Heading2>Key Concepts</Heading2>
            <List>
              <ListItem><strong>MediaDevices</strong>: Accessing the camera and microphone via <InlineCode>getUserMedia</InlineCode>.</ListItem>
              <ListItem><strong>Signaling</strong>: Exchanging SDP offers and answers (locally in the demo, via WebSocket in production).</ListItem>
              <ListItem><strong>ICE Candidates</strong>: Handling network traversal.</ListItem>
            </List>
            <ExternalLink href="https://webrtc.org/getting-started/overview" target="_blank">WebRTC Getting Started →</ExternalLink>
          </>
        )
      case 'api':
        return (
          <>
            <DocHeader>
              <Title>API Data Fetching</Title>
              <Subtitle>Standard patterns for REST interactions.</Subtitle>
            </DocHeader>
            <Text>
              We recommend using the standard <InlineCode>fetch</InlineCode> API with <InlineCode>useEffect</InlineCode> for research purposes to keep dependencies low.
            </Text>
            <Heading2>Loading & Error States</Heading2>
            <CodeBlock>{`const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/hello')
    .then(res => res.json())
    .then(json => setData(json))
    .finally(() => setLoading(false))
}, [])`}</CodeBlock>
          </>
        )
      case 'todo':
        return (
          <>
            <DocHeader>
              <Title>Todo (State Management)</Title>
              <Subtitle>Complex state with backend persistence.</Subtitle>
            </DocHeader>
            <Text>
              The Todo POC demonstrates how to sync local React state with a persistent Hono backend.
            </Text>
            <Heading2>Optimistic Updates</Heading2>
            <Text>
              Update the local UI state immediately for responsiveness, then confirm the change with the backend in the background.
            </Text>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Container>
      <Wrapper>
        <Sidebar>
          <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Getting Started</div>
          <SidebarItem $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</SidebarItem>
          <SidebarItem $active={activeTab === 'adding-pocs'} onClick={() => setActiveTab('adding-pocs')}>Adding POCs</SidebarItem>
          <SidebarItem $active={activeTab === 'backend'} onClick={() => setActiveTab('backend')}>Backend Server</SidebarItem>
          <SidebarItem $active={activeTab === 'testing'} onClick={() => setActiveTab('testing')}>Testing Guide</SidebarItem>
          
          <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 mb-2">Feature Guides</div>
          <SidebarItem $active={activeTab === 'webgl'} onClick={() => setActiveTab('webgl')}>WebGL / 3D</SidebarItem>
          <SidebarItem $active={activeTab === 'websocket'} onClick={() => setActiveTab('websocket')}>WebSockets</SidebarItem>
          <SidebarItem $active={activeTab === 'webrtc'} onClick={() => setActiveTab('webrtc')}>WebRTC / P2P</SidebarItem>
          <SidebarItem $active={activeTab === 'api'} onClick={() => setActiveTab('api')}>API Fetching</SidebarItem>
          <SidebarItem $active={activeTab === 'todo'} onClick={() => setActiveTab('todo')}>State & Persistence</SidebarItem>
          
          <div className="pt-8">
            <Link to="/" className="text-blue-600 text-xs font-bold px-4 hover:underline">← Back to Home</Link>
          </div>
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </Wrapper>
      
      <footer className="my-12 text-gray-400 text-xs flex flex-col items-center gap-1">
        <span className="font-black uppercase tracking-widest opacity-50">Documentation Engine</span>
        <span>Generated for Research Lab 2026</span>
      </footer>
    </Container>
  )
}
