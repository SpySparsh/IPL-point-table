# Sportsfan360: IPL Points Table & Analytics

A real-time, full-stack web application designed to track and visualize the IPL 2026 season. This module features live standings updates, historical match data, and a secure admin dashboard for managing tournament results, built to support high-engagement interactive platforms.

---

## How It Works (System Architecture)

* **Real-Time Data Flow:** The frontend bypasses traditional HTTP polling by utilizing Firestore `onSnapshot` listeners. When the backend writes to the `standings/current` document, the UI updates instantly across all connected clients.
* **Dynamic Recalculation:** The Node.js Express backend handles the heavy lifting. Upon any match CRUD operation (Create, Update, Delete), the backend controllers automatically fetch all historical matches, recalculate the Points, Wins, Losses, and complex Net Run Rate (NRR) edge cases (e.g., 10-wicket bowled out quotas), and overwrite the master standings document.
* **Protected Admin Routes:** The backend uses the Firebase Admin SDK to verify JWT Bearer tokens passed from the frontend. Only authenticated admins can trigger match updates, while read-only points data remains public.
* **Strict Validation:** All incoming match payloads are validated against rigid Zod schemas before interacting with the database.

---

## Tech Stack

**Frontend:** React 18, Vite, React Router DOM, Recharts, Firebase Client SDK
**Backend:** Node.js, Express, TypeScript, Firebase Admin SDK, Zod

---

## Initial Admin Setup

For security, this application does not have a public "Sign Up" page. Admin access must be manually provisioned:
1. Navigate to your Firebase Console -> Authentication -> Users.
2. Click **Add user**.
3. Enter your designated admin email and a secure password.
4. Use these exact credentials to log in via the `/login` route on the frontend.

Admin Email-admin@admin.com
Password-123456

---

## Environment Variables

You will need two separate `.env` files to run this application locally. 

**1. Client Environment (`client/.env`)**
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

**2. Server Environment (`server/.env`)**
* `PORT` (Default: 5000)
* `FIREBASE_PROJECT_ID`
* `FIREBASE_CLIENT_EMAIL`
* `FIREBASE_PRIVATE_KEY` (Ensure newlines are handled correctly)

---

## Local Setup & Scripts

**1. Install Dependencies**
```bash
cd server && npm install
cd ../client && npm install
2. Seed the Database
Clears existing data and populates 10 IPL franchises and 60 seasonal matches.

Bash
cd server
npm run seed  # Or: npx ts-node src/scripts/seedTeams.ts
3. Start Development Servers

Bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
Production Build
The Vite frontend is configured with custom Rollup code-splitting to isolate heavy vendor chunks (React, Firebase, Recharts) for optimized load times.

Bash
# Build Backend
cd server && npm run build && npm start

# Build Frontend
cd client && npm run build && npm run preview

**Final Rule for AI:** Once you have created and saved this `README.md` file to
