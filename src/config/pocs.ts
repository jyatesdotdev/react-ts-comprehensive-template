import React from 'react'

/**
 * Metadata definition for a Proof of Concept (POC).
 */
export interface POCMetadata {
  /** Unique identifier for the POC (used for routing and API links). */
  id: string
  /** Display name of the experiment. */
  name: string
  /** URL path where the POC can be accessed. */
  path: string
  /** The React component to render (usually lazy-loaded). */
  component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>
  /** Optional text for the status badge. */
  badge?: string
  /** Semantic type of the badge for styling purposes. */
  badgeType?: 'WIP' | 'POC' | 'STABLE' | 'Template'
  /** A brief summary of what the POC demonstrates. */
  description: string
  /** Category for logical grouping in the navigation menu. */
  category?: 'Graphics' | 'Network' | 'State' | 'Utility' | 'General'
}

// Lazy load POCs to keep the main bundle small
const WebGLPOC = React.lazy(() => import('../pages/pocs/WebGL'))
const WebGLTemplatePOC = React.lazy(() => import('../pages/pocs/WebGLTemplate'))
const APIPOC = React.lazy(() => import('../pages/pocs/API'))
const TodoPOC = React.lazy(() => import('../pages/pocs/Todo'))
const WebRTCPOC = React.lazy(() => import('../pages/pocs/WebRTC'))
const WebSocketPOC = React.lazy(() => import('../pages/pocs/WebSocket'))
const TemplatePOC = React.lazy(() => import('../pages/pocs/Template'))
const DashboardTestPOC = React.lazy(() => import('../pages/pocs/DashboardTest'))
const RalphExperimentPOC = React.lazy(() => import('../pages/pocs/RalphExperiment'))

/**
 * Central registry of all active Proof of Concepts.
 * 
 * Adding a new entry here automatically registers it for routing 
 * and adds it to the global navigation "Experiments" dropdown.
 */
export const POC_CONFIG: POCMetadata[] = [
  {
    id: 'ralph-experiment',
    name: 'Ralph Experiment',
    path: '/pocs/ralph-experiment',
    component: RalphExperimentPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'Graphics',
    description: 'Research experiment into Ralph Experiment.'
  },
  {
    id: 'dashboard-test',
    name: 'Dashboard Test',
    path: '/pocs/dashboard-test',
    component: DashboardTestPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'General',
    description: 'Research experiment into Dashboard Test.'
  },
  {
    id: 'webgl',
    name: 'WebGL',
    path: '/pocs/webgl',
    component: WebGLPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'Graphics',
    description: 'Experimenting with 3D graphics using Three.js.'
  },
  {
    id: 'webgl-template',
    name: 'WebGL Template',
    path: '/pocs/webgl-template',
    component: WebGLTemplatePOC,
    badge: 'Template',
    badgeType: 'Template',
    category: 'Graphics',
    description: 'A clean starting point for Three.js experiments.'
  },
  {
    id: 'api',
    name: 'API Calls',
    path: '/pocs/api',
    component: APIPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'Network',
    description: 'Testing REST API interactions with the Hono backend.'
  },
  {
    id: 'todo',
    name: 'Todo List',
    path: '/pocs/todo',
    component: TodoPOC,
    badge: 'STABLE',
    badgeType: 'STABLE',
    category: 'State',
    description: 'A classic state management experiment.'
  },
  {
    id: 'webrtc',
    name: 'WebRTC',
    path: '/pocs/webrtc',
    component: WebRTCPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'Network',
    description: 'Peer-to-peer communication loopback demo.'
  },
  {
    id: 'websocket',
    name: 'WebSocket',
    path: '/pocs/websocket',
    component: WebSocketPOC,
    badge: 'POC',
    badgeType: 'POC',
    category: 'Network',
    description: 'Bi-directional messaging with Hono server.'
  },
  {
    id: 'template',
    name: 'New POC',
    path: '/pocs/template',
    component: TemplatePOC,
    badge: 'Template',
    category: 'Utility',
    description: 'Copy this to create a new research experiment.'
  }
]
