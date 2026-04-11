# Architecture Overview

This project is a rapid prototyping environment built with React and Hono. It is designed to be highly modular, allowing developers to spin up new Proof of Concepts (POCs) with both frontend and backend components in seconds.

## Core Pillars

### 1. Modular Proof of Concepts (POCs)
Every experiment is isolated within the `src/pages/pocs/` directory. A central configuration file (`src/config/pocs.ts`) manages the metadata, routing, and lazy-loading of these components.

### 2. Frontend-Backend Bridge
The project uses a unified development environment:
- **Frontend**: React 19 + Vite 8 (Port 5180)
- **Backend**: Hono + Node Server (Port 3001)

Vite is configured as a transparent proxy. Any request to `/api/*` or `/ws` is automatically forwarded to the Hono server, allowing for a seamless development experience without CORS issues.

### 3. Automated Scaffolding
The `npm run create-poc` command uses templates found in `scripts/templates/` to generate:
- A new React component with styled-components and Tailwind.
- A matching Hono route module.
- Automated registration in the frontend config and backend router.

## Design Patterns

### Styled System
We use a hybrid approach for styling:
- **Tailwind CSS 4**: For layout, spacing, and rapid utility-first styling.
- **Styled Components**: For component-level encapsulation and dynamic styles based on props (e.g., the `Badge` and `Switcher` components in `POCLayout`).

### State Management
- **Local State**: React `useState` and `useRef` are preferred for isolated POCs.
- **Server State**: POCs that require persistence (like the `Todo List`) interact with the Hono backend via standard REST patterns.

## Deployment & Production
While designed for local research, the project can be built into a static frontend (`dist/`) and a standalone Hono server. In production, the Hono server can be configured to serve the static assets from the `dist/` folder.
