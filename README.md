# HotelBooking Platform

A full-stack role-based hotel management platform built with React (frontend) and Node.js/Express + MySQL (backend). Guests can browse hotels, make bookings, apply promo codes, and manage their profile. Admins and employees get dedicated dashboards for hotel operations, bookings, rooms, promo codes, and lost & found workflows. Stripe powers secure online payments with webhook-based fulfillment.

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Getting Started](#getting-started)
6. [Database Schema](#database-schema)
7. [Key Workflows](#key-workflows)
8. [Stripe Payments & Webhooks](#stripe-payments--webhooks)
9. [Testing & Tooling](#testing--tooling)
10. [Troubleshooting](#troubleshooting)
11. [Future Enhancements](#future-enhancements)

## Features
### Public Experience
- Marketing site with hero, catalogue, hotel details, amenities, and reviews.
- Auth pages (login/register) with role-based redirects.
- Hotel detail modal for Lost & Found submissions (logged-in users only).

### Simple Users
- Personalized dashboard with stats, upcoming trips, promo hints, and support card.
- Profile page for username/password updates and account deletion.
- Bookings page with payment CTA (Stripe) and booking management.
- Lost & Found reporting tied to hotel/location metadata.

### Admins
- Admin layout with sidebar navigation and global metrics.
- CRUD for users, employees, rooms, hotels, bookings, and promo codes.
- Profile management with modernized UI.
- Auth-only access via `/admin/*` routes guarded by `ProtectedRoute` and JWT.

### Employees
- Dashboard summarizing room/lost & found/bookings KPIs.
- Room management, booking status updates, and lost & found triage.
- Employee profile mirroring the new design language.
- Single layout with nested routes under `/employee-dashboard/*`.

### Cross-cutting
- JWT access tokens stored in `localStorage` (`accessToken`, legacy `token`), refresh token in HttpOnly cookie.
- Axios interceptors via `tokenService.js` for automatic auth headers and refresh.
- Tailwind-inspired styling with custom gradients and cards.
- Reusable navbars/footer that conditionally render by role.

## Tech Stack
- **Frontend:** React 18, React Router 7, Axios, Tailwind CSS utilities, Lucide Icons, Leaflet (maps placeholder), Stripe checkout launchers.
- **Backend:** Node.js, Express, MySQL2 (promise pool), JWT, bcrypt, Multer (uploads), Stripe SDK, dotenv, cookie-parser, cors.
- **Dev Tooling:** Nodemon, React Scripts, Testing Library suits (not yet configured).

## Project Structure
```
HotelBooking/
├─ app.js                  # Express app wiring (middleware, routes)
├─ server.js               # App entrypoint
├─ controllers/            # Route handlers (auth, bookings, promo codes, lost & found, payments, etc.)
├─ routes/                 # Express routers per domain
├─ middlewares/            # Auth + role guards
├─ services/               # Token & refresh helpers
├─ frontend/               # React application
│  ├─ src/
│  │  ├─ components/       # Layouts, navbars, protected route wrapper
│  │  ├─ pages/            # Home, dashboards, detail screens
│  │  ├─ services/         # tokenService, API helpers
│  │  └─ App.js            # Routing + role-based navbars
├─ setUpDatabase.js        # One-shot database/table creation script
└─ uploads/                # Static assets (rooms/hotels)
```

## Environment Variables
Create a `.env` in the project root with at least:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=booking_project
JWT_SECRET=supersecret
REFRESH_TOKEN_SECRET=anothersecret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLIENT_URL=http://localhost:3000
```
> The frontend uses `http://localhost:3000` by default; adjust `CLIENT_URL` if it changes.

## Getting Started
### Prerequisites
- Node.js 18+
- MySQL 8 (or compatible)
- Stripe account + CLI for webhooks (optional during development)

### 1. Install dependencies
```bash
# backend
npm install
# frontend
cd frontend && npm install
```

### 2. Configure environment
- Duplicate `.env.example` (if provided) or create `.env` with the vars above.
- Ensure MySQL is running and credentials match.

### 3. Initialize the database
```
node setUpDatabase.js
```
> This creates `booking_project` and tables (`users`, `hotels`, `rooms`, `bookings`, `lost_and_found`, `reviews`, ...). Run it once; future schema tweaks can be done via migrations/ALTER statements.

### 4. Run the backend
```bash
npm run dev   # starts nodemon on http://localhost:5000
```

### 5. Run the frontend
```bash
cd frontend
npm start      # http://localhost:3000
```

### 6. Login & Roles
- Seed at least one admin/user/employee via SQL or signup + manual role update.
- `Login.js` stores `{ accessToken, token, role, userId }` in `localStorage` and sets refresh cookie.

## Database Schema
Core tables (simplified):
- **users**: `id`, `username`, `password`, `email`, `name`, `birthday`, `role` (`admin|employee|user`).
- **hotels**: `id`, `name`, `address`, `city`, `country`, `phone`, `email`, etc.
- **rooms**: `id`, `hotel_id`, `room_number`, `price`, metadata + uploads.
- **bookings**: `id`, `user_id`, `room_id`, `check_in/out`, `status`, `total_price`, `promo_code_id`.
- **promo_codes**: code metadata, usage tracking (see `controllers/promoCodesController.js`).
- **lost_and_found**: `id`, `hotel_id`, `user_id`, `item_name`, `description`, `date_found`, `location`, `claimed`, `created_at`.
- **payments**: booking linkage, amount, status, Stripe metadata.
- **reviews**: user-generated hotel feedback.

## Key Workflows
### Authentication
1. User logs in → `usersController.login` issues JWT access token + refresh token cookie.
2. Frontend stores role + token, dispatches `auth-change` event used by `App.js` to toggle navbars.
3. `tokenService.js` attaches `Authorization: Bearer <accessToken>`; refresh logic handles expiry.

### Bookings & Promo Codes
- Users book rooms via frontend flows; backend validates promo codes, recalculates totals, and writes usage counts.
- Admins can manage bookings via `/admin/bookings` using the same endpoints.

### Lost & Found
- Public GET `/api/lostfound?hotel_id=ID` (no auth) to list items per hotel.
- Authenticated POST `/api/lostfound` to submit an item (requires `hotel_id`, `item_name`, `date_found`, `location`).
- Employees update `claimed` status via protected routes.

### Employee Dashboard
- Wrapped in `EmployeeLayout` with nested routes (`rooms`, `bookings`, `lostfound`, `profile`).
- Uses shared token service to access `/api/rooms`, `/api/bookings`, etc.

## Stripe Payments & Webhooks
1. Frontend calls `POST /api/payments/create-checkout-session` with `bookingId`.
2. Backend verifies booking, ensures payment row exists, and creates a Stripe Checkout Session.
3. User completes payment on Stripe-hosted page → redirected back to `/user/bookings` with status query params.
4. Stripe sends `checkout.session.completed` webhook to `/api/webhooks/stripe` (raw body parser configured in `app.js`).
5. `stripeWebHookController` marks payment as paid and booking as confirmed.

**Local testing tips:**
- Install Stripe CLI and run `stripe listen --forward-to localhost:5000/api/webhooks/stripe`.
- Set `STRIPE_WEBHOOK_SECRET` to the value provided by Stripe CLI.

## Testing & Tooling
- React Testing Library dependencies are installed (tests not yet implemented).
- Axios logging is sprinkled throughout dashboards/components to aid debugging.
- React DevTools recommended (Chrome/Firefox extension) for inspecting component trees and state.

## Troubleshooting
| Issue | Cause | Fix |
| --- | --- | --- |
| `401 Unauthorized` on dashboards | Missing/expired access token; navbars sometimes duplicated | Ensure `accessToken` and `role` exist in `localStorage`. `tokenService` refreshes tokens and dispatches `auth-change`. |
| `500 Unknown column 'lf.user_id'` | Database created before `user_id` column existed | Run `ALTER TABLE lost_and_found ADD COLUMN user_id INT AFTER hotel_id;` and add FK to `users(id)`. |
| Stripe webhook fails signature | Body parser not raw or secret mismatch | `app.js` mounts `/api/webhooks/stripe` with `express.raw`. Verify `STRIPE_WEBHOOK_SECRET`. |
| Port 5000 already in use | Another process running | Kill old process or change `PORT` in `.env`. |
| Duplicate navbars/footer | Role sync issues pre-fix | Already addressed by `App.js` + `tokenService` event dispatch. |

## Future Enhancements
1. Automated migrations instead of manual SQL/`setUpDatabase.js` reruns.
2. Comprehensive test suites (unit + e2e) covering booking flows and dashboards.
3. Real map embedding for hotels (Leaflet/Google Maps) once API keys configured.
4. Notification system for lost & found status changes.
5. Role management UI for admins to promote/demote users without raw SQL edits.

---
**Maintainers**: Update this README whenever new routes, env vars, or workflows land. Include screenshots or diagrams as the UI evolves for quicker onboarding.
