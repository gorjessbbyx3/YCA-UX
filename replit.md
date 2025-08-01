# Hawaii Youth Challenge Academy Staff Portal

## Overview

This is a full-stack web application designed for staff at the Hawaii Youth Challenge Academy to manage cadets, applications, events, and administrative tasks. The system serves as a comprehensive management portal for the academy's operations across two campuses (Oahu and Hilo).

### About the National Guard Youth Challenge Program

**Mission**: The mission of the National Guard Youth Challenge Program is to intervene in and reclaim the lives of 16-18 year old high school dropouts, producing program graduates with the values, life skills, education, and self-discipline necessary to succeed as productive citizens.

**Program Overview**: The National Guard Youth Challenge Program is a community-based Quasi-Military program that leads, trains and mentors 16–18 year-old high school dropouts so that they may become productive citizens in America's future. This award-winning program has been recognized as one of the nation's most effective and cost efficient programs for targeting youth who are at the greatest risk for substance abuse, teen pregnancy, delinquency, and criminal activity.

**Program Structure**: The 22-week Residential Phase is followed by a year-long mentoring relationship with a specially trained member from each youth's community.

**Eight Core Components**:
1. **Academy Excellence** - Academic achievement and educational goals
2. **Health and Hygiene** - Personal wellness and health practices
3. **Job Skills** - Career preparation and vocational training
4. **Leadership/Followership** - Leadership development and teamwork
5. **Life Coping Skills** - Personal development and resilience
6. **Service to the Community** - Civic engagement and community service
7. **Physical Fitness** - Health, fitness, and physical conditioning
8. **Responsible Citizenship** - Civic responsibility and character development

## Recent Changes (January 2025)
- Added dedicated Calendar page with comprehensive month/week/day views and event creation
- Restructured Scheduling page to focus on advanced event management, bulk creation, and resource allocation
- Updated navigation system to separate Calendar and Event Scheduling functionality
- Enhanced event management with conflict detection and recurring event support

## User Preferences

Preferred communication style: Simple, everyday language.
Background style: Light military green theme.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Hawaii-themed design tokens
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration System**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- Replit Auth integration for user authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (staff, admin, instructor)
- Campus-based data filtering

### Data Models
- **Users**: Staff accounts with roles and campus assignments
- **Cadets**: Student records with comprehensive tracking aligned with the 8 core program components
- **Applications**: Admission applications with status workflow for 16-18 year old high school dropouts
- **Events**: Campus events with comprehensive scheduling, recurring events, and conflict detection
- **Mentorships**: Mentor-cadet relationships supporting the year-long post-residential mentoring phase
- **Inventory**: Equipment and resource tracking for program operations
- **Activities**: System activity logging for program compliance and reporting

### Key Pages
- **Dashboard**: Real-time metrics and activity overview
- **Calendar**: Month/week/day views with event creation and management
- **Event Scheduling**: Advanced bulk event creation and resource conflict management
- **Cadet Management**: Comprehensive cadet tracking and progress monitoring
- **Academic Progress**: Grade tracking and performance analytics
- **Applications**: Application review with AI-powered insights
- **Mentorship**: Mentor-cadet relationship tracking
- **Inventory**: Equipment and resource management with alerts
- **Reports**: Analytics and data visualization

### AI Integration
- Google Gemini AI for application analysis and insights
- Automated cadet assessment and recommendation generation
- Natural language processing for application review

### UI Components
- Custom component library based on Shadcn/ui
- Responsive design with mobile-first approach
- Consistent theming with Hawaii Youth Challenge Academy branding
- Interactive dashboards with real-time metrics

## Data Flow

### Authentication Flow
1. User accesses the application
2. Replit Auth redirects to OIDC provider
3. Session established and stored in PostgreSQL
4. User profile cached for subsequent requests

### Application Management Flow
1. Staff reviews incoming applications
2. AI analysis provides insights and recommendations
3. Status updates trigger activity logging
4. Notifications sent for status changes

### Dashboard Data Flow
1. Frontend requests dashboard metrics
2. Backend aggregates data from multiple tables
3. Real-time updates via periodic polling
4. Campus-filtered data based on user permissions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **@google/genai**: Google Gemini AI integration
- **@tanstack/react-query**: Client-side state management
- **drizzle-orm**: Database ORM and query builder
- **express**: Web server framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Primitive UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
1. Frontend built with Vite to static assets
2. Backend bundled with esbuild for Node.js
3. Database schema deployed via Drizzle migrations
4. Environment variables configured for production

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Node.js server serving static frontend assets
- **Database**: Neon PostgreSQL with connection pooling
- **Sessions**: PostgreSQL-backed session storage

### Monitoring and Logging
- Request/response logging with duration tracking
- Error handling with structured error responses
- Activity tracking for audit trails
- Performance monitoring via query timing

The application follows a monorepo structure with shared types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.