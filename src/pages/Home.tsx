import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { POC_CONFIG } from '../config/pocs'

// Container is the primary layout wrapper.
// Adjusting 'min-h-screen' ensures the background covers the full viewport height.
const Container = styled.div.attrs({
  className: 'min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans'
})``

// Header contains the main title and introduction.
// Adjusting 'text-center max-w-2xl' centers the text and restricts width for readability.
const Header = styled.header.attrs({
  className: 'mb-12 text-center max-w-2xl'
})``

// Title is the large, colorful main heading.
// Adjusting 'bg-gradient-to-r' and 'text-transparent bg-clip-text' creates the modern gradient text effect.
const Title = styled.h1.attrs({
  className: 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 tracking-tight'
})``

// Subtitle acts as a smaller descriptive text below the Title.
// Adjusting 'text-xl text-gray-600' controls its visual hierarchy relative to the Title.
const Subtitle = styled.p.attrs({
  className: 'text-xl text-gray-600 leading-relaxed'
})``

// Section delineates major content areas on the homepage.
// Adjusting 'max-w-4xl' constrains the width, and 'bg-white shadow-xl rounded-2xl' gives it a floating card look.
const Section = styled.section.attrs({
  className: 'max-w-4xl w-full bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100'
})``

// SectionTitle creates headers for the sections.
// Adjusting 'flex items-center gap-2' allows for inline icons or badges next to the text.
const SectionTitle = styled.h2.attrs({
  className: 'text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'
})``

// POCGrid is a responsive container for iterating over experiment cards.
// Adjusting 'grid-cols-1 sm:grid-cols-2' specifies a single column on mobile and two columns on larger screens.
const POCGrid = styled.div.attrs({
  className: 'grid grid-cols-1 sm:grid-cols-2 gap-6'
})``

// POCCard represents an individual experiment link card.
// Adjusting 'group hover:shadow-xl hover:border-blue-400' creates an interactive lift effect without moving the element.
const POCCard = styled(Link).attrs({
  className: 'group p-6 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col gap-3'
})``

// LinkCard is a stylized pill-shaped link for external resources.
// Adjusting 'hover:bg-blue-50 hover:text-blue-600' provides feedback when hovering over a tech stack item.
const LinkCard = styled.a.attrs({
  className: 'p-3 border border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 text-center text-sm font-bold text-gray-600'
})``

// CodeBlock displays formatted code snippets.
// Adjusting 'bg-gray-900 text-gray-100' creates a dark editor-like theme for syntax.
const CodeBlock = styled.pre.attrs({
  className: 'bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-4 text-sm font-mono leading-relaxed'
})``

// Badge signifies the status of an experiment inline.
// Modifying the colors allows the addition of new statuses inside the template literal.
const Badge = styled.span.attrs<{ type?: string }>((props) => ({
  className: `px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
    props.type === 'WIP' ? 'bg-yellow-100 text-yellow-700' : 
    props.type === 'POC' ? 'bg-blue-100 text-blue-700' : 
    props.type === 'STABLE' ? 'bg-green-100 text-green-700' :
    props.type === 'Template' ? 'bg-purple-100 text-purple-700' :
    'bg-gray-100 text-gray-600'
  }`
}))<{ type?: string }>``

export default function Home() {
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
  
  const categories = Array.from(new Set(POC_CONFIG.map(p => p.category || 'General')))
  
  const filteredPocs = activeCategory === 'All' 
    ? POC_CONFIG 
    : POC_CONFIG.filter(poc => (poc.category || 'General') === activeCategory)

  return (
    <Container>
      <Header>
        <Title>Research Lab</Title>
        <Subtitle>Extensible React + TS playground for rapid prototyping and experiments.</Subtitle>
      </Header>

      <Section>
        <SectionTitle>
          <Badge type="POC">Explore</Badge> Active POCs
        </SectionTitle>
        
        {/* Quick Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-50 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === 'All' 
                ? 'bg-blue-600 shadow-lg shadow-blue-200 text-white' 
                : 'bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600'
            }`}
          >
            All Experiments
          </button>
          {categories.map(category => (
            <button 
              key={category} 
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === category 
                  ? 'bg-blue-600 shadow-lg shadow-blue-200 text-white' 
                  : 'bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <POCGrid>
          {filteredPocs.map(poc => (
            <POCCard key={poc.id} to={poc.path}>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{poc.name}</h3>
                {poc.badge && <Badge type={poc.badgeType}>{poc.badge}</Badge>}
              </div>
              <p className="text-gray-600 text-sm">{poc.description}</p>
              <div className="mt-auto pt-4 flex items-center text-blue-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Project →
              </div>
            </POCCard>
          ))}
        </POCGrid>
      </Section>

      <Section>
        <SectionTitle>
          <Badge>Stack</Badge> Full Technology Stack
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Core Frameworks</h4>
            <div className="flex flex-col gap-2">
              <LinkCard href="https://react.dev" target="_blank">React 19</LinkCard>
              <LinkCard href="https://vite.dev" target="_blank">Vite 8</LinkCard>
              <LinkCard href="https://hono.dev" target="_blank">Hono 4</LinkCard>
              <LinkCard href="https://typescriptlang.org" target="_blank">TypeScript 6.0</LinkCard>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">UI & Styling</h4>
            <div className="flex flex-col gap-2">
              <LinkCard href="https://tailwindcss.com" target="_blank">Tailwind CSS 4</LinkCard>
              <LinkCard href="https://styled-components.com" target="_blank">Styled Components</LinkCard>
              <LinkCard href="https://reactrouter.com" target="_blank">React Router 7</LinkCard>
              <LinkCard href="https://lucide.dev" target="_blank">Lucide Icons</LinkCard>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Testing & QA</h4>
            <div className="flex flex-col gap-2">
              <LinkCard href="https://vitest.dev" target="_blank">Vitest</LinkCard>
              <LinkCard href="https://playwright.dev" target="_blank">Playwright</LinkCard>
              <LinkCard href="https://testing-library.com" target="_blank">Testing Library</LinkCard>
              <LinkCard href="https://eslint.org" target="_blank">ESLint 9</LinkCard>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Specialized Tech</h4>
            <div className="flex flex-col gap-2">
              <LinkCard href="https://threejs.org" target="_blank">Three.js (WebGL)</LinkCard>
              <LinkCard href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank">WebSockets</LinkCard>
              <LinkCard href="https://webrtc.org" target="_blank">WebRTC (P2P)</LinkCard>
              <LinkCard href="https://hono.dev/docs/helpers/websocket" target="_blank">Hono WS Helper</LinkCard>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          <Badge type="Template">Blueprints</Badge> Starter Templates
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <POCCard to="/pocs/webgl-template">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">WebGL Blueprint</h3>
              <Badge type="Template">WebGL</Badge>
            </div>
            <p className="text-gray-600 text-sm">A robust Three.js setup with OrbitControls, lighting, and memory-safe disposal.</p>
          </POCCard>
          <POCCard to="/pocs/template">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">General Blueprint</h3>
              <Badge type="Template">UI</Badge>
            </div>
            <p className="text-gray-600 text-sm">Clean starter for UI-heavy experiments using Tailwind and Styled Components.</p>
          </POCCard>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          <Badge>New POC</Badge> Rapid Prototyping
        </SectionTitle>
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">CLI Scaffolding</span>
          </div>
          <div className="p-6">
            <p className="text-blue-400 font-mono text-sm mb-4">$ npm run create-poc "My New Feature" [type]</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-400 text-[11px] font-mono">TYPES:</p>
                <p className="text-white text-xs font-mono">basic <span className="text-gray-500">(default)</span></p>
                <p className="text-white text-xs font-mono">webgl <span className="text-gray-500">(Three.js)</span></p>
                <p className="text-white text-xs font-mono">websocket <span className="text-gray-500">(Real-time)</span></p>
                <p className="text-white text-xs font-mono">webrtc <span className="text-gray-500">(P2P)</span></p>
                <p className="text-white text-xs font-mono">api <span className="text-gray-500">(REST)</span></p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">What it does:</p>
                <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
                  <li>Creates React Component</li>
                  <li>Generates Hono Backend Module</li>
                  <li>Wires up API routes</li>
                  <li>Updates Navbar & Routing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Frontend Configuration
            </h3>
            <p className="text-xs text-gray-500 mb-3">POC metadata is managed centrally in one file.</p>
            <CodeBlock className="text-[10px]">{`// src/config/pocs.ts
{
  id: 'my-feature',
  name: 'My Feature',
  path: '/pocs/my-feature',
  component: React.lazy(() => import('../pages/pocs/MyFeature')),
  description: 'Research experiment.'
}`}</CodeBlock>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Backend Extension (Hono)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Modular routes for every research project.</p>
            <CodeBlock className="text-[10px]">{`// server/routes.ts
import myPoc from './pocs/my-poc'
api.route('/pocs/my-poc', myPoc)`}</CodeBlock>
          </div>
        </div>
      </Section>


      <footer className="mt-12 text-gray-400 text-sm font-medium">
        Designed for modularity & developer experience.
      </footer>
    </Container>
  )
}

