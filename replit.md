# Daily Planner

## Overview

A peaceful, minimal daily planner web application focused on calm productivity and long-term consistency. The app helps users track daily tasks (like certifications, learning goals) and gym workouts with streak tracking. Built with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions and premium feel
- **Design Philosophy**: Calm, minimal UI with soft colors (off-white backgrounds, muted accents like sage green and soft blue)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: scrypt for password hashing with timing-safe comparison

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**:
  - `users`: Authentication with username/password
  - `tasks`: Daily tasks with completion status and streak tracking
  - `gymLogs`: Workout tracking with pushups count, biceps sets, and shoulder sets (using JSONB for flexible set data)
- **Migrations**: Drizzle Kit for schema management (`db:push` command)

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components (shadcn/ui based)
│       ├── hooks/        # Custom React hooks (auth, tasks, gym)
│       ├── pages/        # Route pages (dashboard, gym, auth)
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API contract definitions
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared Types**: Database schemas and API contracts are defined once in `shared/` and used by both frontend and backend
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **Protected Routes**: Frontend uses `ProtectedRoute` component to guard authenticated pages
- **Path Aliases**: TypeScript paths configured for `@/` (client/src), `@shared/` (shared), and `@assets/` (attached_assets)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **passport**: Authentication middleware
- **passport-local**: Username/password authentication strategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store (available but may use in-memory for development)

### UI Components
- **@radix-ui/***: Primitive components for accessible UI (dialogs, dropdowns, checkboxes, etc.)
- **shadcn/ui**: Pre-built component library built on Radix primitives
- **lucide-react**: Icon library
- **framer-motion**: Animation library

### Build & Development
- **Vite**: Frontend development server and bundler
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (optional, has fallback)