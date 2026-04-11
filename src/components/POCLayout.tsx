import styled from 'styled-components'
import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { POC_CONFIG } from '../config/pocs'

const Container = styled.div.attrs({
  className: 'min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans'
})``

const Header = styled.header.attrs({
  className: 'mb-8 text-center max-w-2xl'
})``

const Title = styled.h1.attrs({
  className: 'text-4xl font-black text-gray-900 mb-2'
})``

const Subtitle = styled.p.attrs({
  className: 'text-lg text-gray-600'
})``

const Content = styled.section.attrs({
  className: 'max-w-5xl w-full bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100'
})``

const Badge = styled.span.attrs<{ $type?: string }>((props) => ({
  className: `px-2 py-0.5 rounded text-[10px] font-black uppercase ${
    props.$type === 'WIP' ? 'bg-yellow-100 text-yellow-700' : 
    props.$type === 'POC' ? 'bg-blue-100 text-blue-700' : 
    props.$type === 'STABLE' ? 'bg-green-100 text-green-700' :
    props.$type === 'Template' ? 'bg-purple-100 text-purple-700' :
    'bg-gray-100 text-gray-600'
  }`
}))<{ $type?: string }>``

const Breadcrumb = styled.nav.attrs({
  className: 'flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest'
})`
  width: max-content;
  flex: none;
`

const BreadcrumbLink = styled(Link).attrs({
  className: 'hover:text-blue-600 transition-colors'
})`
  flex: none;
`

const SwitcherContainer = styled.div.attrs({
  className: 'relative'
})`
  flex: none;
`

const SwitcherButton = styled.button.attrs({
  className: 'flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors text-[10px] font-black'
})`
  width: max-content;
  flex: none;
`

const SwitcherMenu = styled.div.attrs<{ $isOpen: boolean }>((props) => ({
  className: `absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] transition-all duration-200 origin-top-left ${
    props.$isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 pointer-events-none invisible'
  }`,
  style: { display: props.$isOpen ? 'block' : 'none' }
}))<{ $isOpen: boolean }>``

const SwitcherItem = styled(Link).attrs<{ $active?: boolean }>((props) => ({
  className: `block px-4 py-2 text-sm transition-all ${
    props.$active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
  }`
}))<{ $active?: boolean }>``

interface POCLayoutProps {
  /** The primary heading displayed at the top of the POC. */
  title: string
  /** An optional description or context for the experiment. */
  subtitle?: string
  /** The text displayed inside the status badge (e.g., "POC", "WIP"). */
  badge?: string
  /** The semantic type of the badge, which determines its color scheme. */
  badgeType?: 'WIP' | 'POC' | 'STABLE' | 'Template'
  /** The main content of the experiment. */
  children: React.ReactNode
  /** Optional ID used to link to the corresponding backend API endpoint. */
  pocId?: string
}

/**
 * The standard layout wrapper for all Proof of Concept (POC) pages.
 * 
 * It provides a consistent header with breadcrumbs, an experiment switcher, 
 * automated backend API linking, and a responsive container for experimental content.
 */
export default function POCLayout({ title, subtitle, badge, badgeType, children, pocId }: POCLayoutProps) {
  const [copied, setCopied] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const copyPath = () => {
    navigator.clipboard.writeText(window.location.pathname)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const backendUrl = pocId ? `http://localhost:3001/api/pocs/${pocId}` : null

  return (
    <Container>
      <div className="max-w-5xl w-full flex justify-between items-center mb-6">
        <Breadcrumb>
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
          <span className="text-gray-300">/</span>
          <SwitcherContainer ref={switcherRef}>
            <SwitcherButton onClick={(e) => { e.stopPropagation(); setIsSwitcherOpen(!isSwitcherOpen); }}>
              <span className="text-gray-900">Experiments</span>
              <svg className={`w-3 h-3 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </SwitcherButton>
            <SwitcherMenu $isOpen={isSwitcherOpen}>
              <div className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                Switch Experiment
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {POC_CONFIG.map(poc => (
                  <SwitcherItem 
                    key={poc.id} 
                    to={poc.path} 
                    $active={location.pathname === poc.path}
                    onClick={() => setIsSwitcherOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{poc.name}</span>
                      {poc.badge && <span className="text-[8px] font-black uppercase opacity-60">{poc.badge}</span>}
                    </div>
                  </SwitcherItem>
                ))}
              </div>
            </SwitcherMenu>
          </SwitcherContainer>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600 font-black">{title}</span>
        </Breadcrumb>

        <div className="flex gap-2">
          {backendUrl && (
            <a 
              href={backendUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l4-4m-4 4l4 4" />
              </svg>
              Backend API
            </a>
          )}
          <button 
            onClick={copyPath}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            {copied ? 'Copied!' : 'Copy Path'}
          </button>
        </div>
      </div>

      <Header>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Title>{title}</Title>
          {badge && <Badge $type={badgeType}>{badge}</Badge>}
        </div>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Header>

      <Content>
        {children}
      </Content>

      <footer className="mt-8 text-gray-400 text-sm flex flex-col items-center gap-4">
        <Link to="/" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Experimental Environment</span>
          <span className="text-[10px] font-medium">React 19 + Hono + Vite</span>
        </div>
      </footer>
    </Container>
  )
}
