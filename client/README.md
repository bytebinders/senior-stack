# Crime Tracking Web Application

A simple, secure, cloud-hosted crime tracking system.

## Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Shadcn UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Replit Built-in) + Drizzle ORM
- **Authentication**: Session-based (Passport.js) + bcrypt

## Features

- **Authentication**:
  - Secure Login/Register
  - Role-based Access Control (Admin vs Reporter)
- **Reporter Role**:
  - Submit crime reports (Title, Description, Category)
  - View own submitted reports
- **Admin Role**:
  - View all reports
  - Filter reports by status or category
  - Update report status (Pending -> Reviewed -> Closed)
  - Delete reports
- **Security**:
  - Password hashing with bcrypt
  - Protected API routes
  - HTTP-only sessions

## Setup & Run

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Database Setup**:
   The database is automatically provisioned on Replit.
   Push the schema:

   ```bash
   npm run db:push
   ```

3. **Start the Application**:
   ```bash
   npm run dev
   ```

## Default Credentials (Seed Data)

The system comes with pre-seeded accounts for testing:

- **Admin**:

  - Username: `admin`
  - Password: `admin123`

- **Reporter**:
  - Username: `reporter`
  - Password: `reporter123`

## Deployment

This project is separated so you can deploy the **frontend** and **backend** independently.

### Frontend (Vercel)

- Connect the `client` folder to Vercel as a project. Use the default Vite build command (`npm run build`) and publish directory `dist`.
- Environment variable:
  - `VITE_API_BASE` — the base URL of your backend (e.g. `https://your-backend.onrender.com`). Leave empty for same-origin setups.

### Backend (Render / any Node host)

- Deploy the `server` folder as a Node web service (or use the root repository with `cd server` build commands).
- Run the server build (`npm run build` in the `server` folder) and start the result (`node dist/index.cjs`).
- Recommended environment variables:
  - `PORT` — (optional) port for the server (platforms usually set this automatically).
  - `DATABASE_URL` — Postgres connection string.
  - `SESSION_SECRET` — strong secret used for session signing.
  - `FRONTEND_ORIGIN` — URL of your frontend (e.g. `https://your-frontend.vercel.app`) to restrict CORS.
  - `SERVE_CLIENT` — set to `1` only if you want the server to also serve the client build (single-host deployment).

### Local builds

- Root scripts added for convenience:
  - `npm run build:client` — builds the frontend (`cd client && npm run build`).
  - `npm run build:server` — builds the server (`cd server && npm run build`).
  - `npm run build` — builds both (you can also set `BUILD=client` or `BUILD=server` to restrict).

> Tip: For Vercel deploys set `VITE_API_BASE` to your backend's public URL, and on the backend set `FRONTEND_ORIGIN` to your Vercel URL to allow authenticated cookie requests from the frontend.
