# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Client Channel API Playground** - a developer tool for testing and debugging client channel integrations with Pega's Digital Messaging System (DMS). The application provides a visual interface to configure API settings, simulate chat sessions, and view SDK implementation examples.

**Current State**: Frontend is fully functional with mock data. Backend integration with `dms-client-channel` NPM package is needed to connect to real Pega DMS services.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Tech Stack & Architecture

- **Frontend**: React 18.3.1 + TypeScript + Vite with SWC
- **UI Library**: shadcn/ui components (40+ components) built on Radix UI
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks + TanStack Query (configured but not yet used)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Platform**: Built for Lovable development platform

## Key Component Architecture

### Main Application Structure
- **src/pages/Index.tsx**: Main application page that composes all feature components
- **src/App.tsx**: Root component with routing and theme provider setup
- **src/main.tsx**: Application entry point with QueryClient and Router setup

### Feature Components (currently using mock data)
- **ConfigPanel.tsx**: API configuration interface with JWT/Customer ID validation
- **ChatSession.tsx**: Interactive chat simulation with message type selection
- **ActivityPanel.tsx**: Activity monitoring and logging dashboard  
- **SDKViewer.tsx**: Code documentation with multi-language examples
- **DebugTools.tsx**: Debug information and API monitoring tools
- **ThemeCustomizer.tsx**: Theme switching and customization

### UI Components
- **src/components/ui/**: Complete shadcn/ui implementation with 40+ components
- **src/lib/utils.ts**: Utility functions including `cn()` for Tailwind class merging
- **src/hooks/**: Custom hooks for mobile detection and toast notifications

## Current State & Integration Needs

The frontend is fully built with mock functionality. The next phase requires:

1. **Backend Server**: Node.js/Express server with `dms-client-channel` package integration
2. **API Endpoints**: REST endpoints for DMS communication (`/api/connect`, `/api/send-message`, `/dms` webhook)
3. **Real-time Communication**: WebSocket/SSE for live message updates
4. **Frontend Updates**: Replace mock functions with real API calls in existing components

## Important Patterns

### Component Composition
The application uses a composition pattern where the main Index page combines feature components:
```typescript
// All components receive shared state via props
<ConfigPanel onConfigChange={handleConfigChange} />
<ChatSession config={config} onMessageSend={handleMessage} />
<ActivityPanel logs={activityLogs} />
```

### State Management
- Local component state using `useState`
- Props drilling for shared state (no global state management)
- TanStack Query client configured for future server state

### Styling System
- CSS variables for theme system (`--primary`, `--secondary`, etc.)
- Tailwind utility classes with `cn()` helper for conditional styling
- Dark mode support via class-based theme switching

### Import Patterns
- Path alias `@/` maps to `./src/`
- UI components imported from `@/components/ui/`
- Utilities imported from `@/lib/utils`

## Development Workflow

This project integrates with the Lovable platform:
- Changes made via Lovable are automatically committed
- Local development supports standard Git workflow
- Component tagging enabled in development mode via `lovable-tagger`

## Environment Configuration

- **Development Server**: Vite dev server on port 8080 with IPv6 support
- **Build Tool**: Vite with React SWC for fast compilation
- **TypeScript**: Relaxed configuration with path mapping support
- **ESLint**: Modern configuration with React and TypeScript rules

## Key Files for Backend Integration

When implementing backend integration, focus on these frontend components:
- **ConfigPanel.tsx**: Update connection testing and credential validation
- **ChatSession.tsx**: Replace mock message sending with real API calls
- **ActivityPanel.tsx**: Connect to real activity logs from backend
- **DebugTools.tsx**: Display actual API request/response data

The existing component interfaces and props structure should be maintained to preserve the current UX.