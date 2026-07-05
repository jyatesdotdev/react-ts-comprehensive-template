import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { POC_CONFIG } from '../config/pocs'

// Nav is the main navigation bar container.
// Adjusting 'sticky top-0 z-50' controls its sticky behavior at the top of the viewport. Modifying 'bg-white/80 backdrop-blur-md' adjusts the glass effect.
const Nav = styled.nav.attrs({
  className: 'w-full bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 px-8 sticky top-0 z-50 flex items-center justify-between shadow-sm'
})``

// NavLinks is the wrapper for the navigational links.
// Adjusting 'gap-2' alters the space between each link.
const NavLinks = styled.div.attrs({
  className: 'flex gap-2 items-center'
})``

// NavLink represents an individual top-level link.
// Adjusting the dynamic literal changes the colors depending on whether the link is active.
const NavLink = styled(Link).attrs<{ $active?: boolean }>((props) => ({
  className: `px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
    props.$active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
  }`
}))<{ $active?: boolean }>``

// DropdownContainer provides the relative positioning context for the dropdown menu.
// Changing 'group' wouldn't work well here since we control the menu state via React, but 'relative' is essential.
const DropdownContainer = styled.div.attrs({
  className: 'relative group'
})``

// DropdownButton is the trigger to open the Experiments dropdown.
// Adjusting 'bg-blue-600 text-white' changes the appearance when the current page is an experiment.
const DropdownButton = styled.button.attrs<{ $active?: boolean }>((props) => ({
  className: `px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
    props.$active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
  }`
}))<{ $active?: boolean }>``

// DropdownMenu is the container for the list of POC links.
// Adjusting 'origin-top-right' changes the pivot point for the scaling animation.
const DropdownMenu = styled.div.attrs<{ $isOpen: boolean }>((props) => ({
  className: `absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right ${
    props.$isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
  }`
}))<{ $isOpen: boolean }>``

// DropdownItem is the wrapper for an individual POC link inside the dropdown.
// Adjusting 'p-4' alters the padding around the item content.
const DropdownItem = styled(Link).attrs<{ $active?: boolean }>((props) => ({
  className: `flex flex-col p-4 transition-all ${
    props.$active ? 'bg-blue-50' : 'hover:bg-gray-50'
  }`
}))<{ $active?: boolean }>``

// Logo is the primary branding element on the left side of the Navbar.
// Adjusting 'bg-gradient-to-r' changes the gradient direction, while 'from-blue-600 via-purple-600 to-indigo-600' modifies the colors.
const Logo = styled(Link).attrs({
  className: 'text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter'
})``

// Badge represents the status tag of a POC in the menu.
// Modifying the colors allows the creation of new types of badges.
const Badge = styled.span.attrs<{ $type?: string }>((props) => ({
  className: `px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
    props.$type === 'WIP' ? 'bg-yellow-100 text-yellow-700' : 
    props.$type === 'POC' ? 'bg-blue-100 text-blue-700' : 
    props.$type === 'STABLE' ? 'bg-green-100 text-green-700' :
    props.$type === 'Template' ? 'bg-purple-100 text-purple-700' :
    'bg-gray-100 text-gray-600'
  }`
}))<{ $type?: string }>``

// CategoryHeader is the separator title for the POC categories.
// Adjusting 'bg-gray-50 text-gray-400' gives it a subtle appearance.
const CategoryHeader = styled.div.attrs({
  className: 'px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest'
})``

export default function Navbar() {
  const location = useLocation()
  const [isPocMenuOpen, setIsPocMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAtPoc = location.pathname.startsWith('/pocs')

  // Group POCs by category
  const groupedPocs = POC_CONFIG.reduce((acc, poc) => {
    const category = poc.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(poc)
    return acc
  }, {} as Record<string, typeof POC_CONFIG>)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsPocMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Nav>
      <Logo to="/">RESEARCH LAB</Logo>
      <NavLinks>
        <NavLink to="/" $active={location.pathname === '/'}>Home</NavLink>
        <NavLink to="/tutorials" $active={location.pathname.startsWith('/tutorials')}>Tutorials</NavLink>
        
        <DropdownContainer ref={menuRef}>
          <DropdownButton 
            $active={isAtPoc} 
            onClick={() => setIsPocMenuOpen(!isPocMenuOpen)}
          >
            Experiments
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isPocMenuOpen ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </DropdownButton>

          <DropdownMenu $isOpen={isPocMenuOpen}>
            {Object.entries(groupedPocs).map(([category, pocs]) => (
              <div key={category}>
                <CategoryHeader>{category}</CategoryHeader>
                {pocs.map(poc => (
                  <DropdownItem 
                    key={poc.id} 
                    to={poc.path} 
                    $active={location.pathname === poc.path}
                    onClick={() => setIsPocMenuOpen(false)}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-bold ${location.pathname === poc.path ? 'text-blue-600' : 'text-gray-800'}`}>
                        {poc.name}
                      </span>
                      {poc.badge && <Badge $type={poc.badgeType}>{poc.badge}</Badge>}
                    </div>
                    <span className="text-[11px] text-gray-500 line-clamp-1">{poc.description}</span>
                  </DropdownItem>
                ))}
              </div>
            ))}
          </DropdownMenu>
        </DropdownContainer>
      </NavLinks>
    </Nav>
  )
}
