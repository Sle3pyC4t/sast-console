# SAST Console

This is the management console for the SAST (Static Application Security Testing) system. It provides a web interface for managing agents, tasks, and viewing security scan results.

## Features

- Agent management (registration, status monitoring)
- Task creation and management
- Security scan results visualization
- Vulnerability tracking and reporting

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Vercel Postgres)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for deployment)
- Vercel Postgres database

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```
POSTGRES_URL="your-postgres-connection-string"
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

The database schema is defined in `app/lib/db/schema.sql`. You can apply this schema to your Vercel Postgres database using the Vercel dashboard or CLI.

## API Endpoints

The console provides the following API endpoints for agent communication:

- `POST /api/agents/register` - Register a new agent
- `POST /api/agents/:id/heartbeat` - Send agent heartbeat
- `GET /api/agents/:id/tasks` - Get tasks for an agent
- `PATCH /api/tasks/:id` - Update task status
- `POST /api/tasks/:id/results` - Submit scan results

## Deployment

The console is designed to be deployed on Vercel:

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Configure the Vercel Postgres database
4. Deploy the application

## License

This software is provided under the MIT License. 