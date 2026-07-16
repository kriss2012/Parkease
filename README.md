# ParkEase — Mall Parking Management System

A full-stack platform for booking, managing, and guarding mall parking: users reserve
slots and get a QR code, guards scan it to validate entry/exit, mall owners manage
floors/slots/pricing, and admins approve malls and oversee the whole platform.

## ⚠️ Before you start

This project was generated as a complete, from-scratch codebase — every model, route,
controller, and page listed below is implemented with real logic (atomic slot locking,
signed/expiring QR codes, a booking state machine, billing with late-exit penalties,
role-based dashboards, etc). It has **not been run or tested** in this environment, so
treat it as a strong, working-quality starting point rather than a verified deploy —
run it locally, fix any dependency-version hiccups, and test each flow before shipping.

Not included (flagged as bonus items in the spec and out of scope for this pass):
Redis caching, Swagger UI, automated test suites, and GitHub Actions CI/CD. The
architecture (clean controller/route separation, consistent error handling) makes all
of these straightforward to add later — ask if you'd like any of them scaffolded next.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, React Hook Form, TanStack Query, Recharts, html5-qrcode, Framer Motion
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT (access + refresh), bcrypt, Multer, Nodemailer, Helmet, Morgan, express-validator
- **Database:** MongoDB (Atlas in production, local via Docker for dev)

## Project structure

```
parkease/
├── client/          React frontend (Vite)
├── server/          Express API
├── docs/API.md      Full route reference
├── database/SCHEMA.md
├── uploads/          local file storage
├── docker-compose.yml
└── README.md
```

## Getting started (local, without Docker)

### 1. Backend
```bash
cd server
cp .env.example .env       # fill in MONGO_URI, JWT secrets, SMTP creds
npm install
npm run seed                # creates demo admin/owner/guard/user + a sample mall
npm run dev                  # http://localhost:5000
```

### 2. Frontend
```bash
cd client
cp .env.example .env         # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                  # http://localhost:5173
```

### Demo logins (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@parkease.com | Admin@123 |
| Owner | owner@parkease.com | Owner@123 |
| Guard | guard@parkease.com | Guard@123 |
| User | user@parkease.com | User@123 |

## Getting started (Docker)
```bash
cp server/.env.example server/.env   # set JWT/QR secrets; MONGO_URI is overridden by compose
docker compose up --build
```
This starts MongoDB, the API (port 5000), and the built frontend behind nginx (port 5173).

## Environment variables

See `server/.env.example` and `client/.env.example` for the full list. Key ones:

- `MONGO_URI` — MongoDB Atlas (or local) connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — sign access/refresh tokens
- `QR_SECRET` — HMAC key used to sign/verify QR payloads (bookingId + expiry + hash)
- `SMTP_*` — outbound email (booking confirmations, mall approvals, etc.)
- `GST_RATE` — tax percentage applied to bookings

## How the core systems work

**Atomic slot allocation.** Booking creation uses a single
`ParkingSlot.findOneAndUpdate({ mall, vehicleType, status: 'available' }, { status: 'reserved' })`
call. MongoDB executes this atomically at the document level, so two simultaneous
booking requests can never claim the same slot — one will succeed, the other gets
`409 No available slots`.

**QR codes.** Each confirmed booking's QR encodes `{ bookingId, expiry, hash }`, where
`hash = HMAC-SHA256(bookingId:expiry, QR_SECRET)`. A guard's scan is verified server-side
(signature + expiry), never trusted client-side — the guard app just tells the guard
whether to process an entry or exit; it never lets them manually approve.

**Booking lifecycle.** `pending → confirmed → entered → completed`, with `cancelled`
and `expired` as terminal side-branches. Each transition is enforced server-side in
`bookingController` and `guardController` (e.g. exit requires `entered` + a prior
`entryTime`).

**Billing.** On exit, `utils/billing.js` computes base charge (hourly rate × planned
duration) + late-exit penalty (1.5× hourly rate per hour over the planned exit,
computed in full-hour blocks) + GST, producing the final invoice.

## Deployment

- **Backend → Render:** New Web Service, root `server/`, build `npm install`, start `npm start`, add the env vars above.
- **Frontend → Vercel:** Root `client/`, framework preset "Vite", set `VITE_API_URL` to your Render URL + `/api`.
- **Database → MongoDB Atlas:** create a free cluster, whitelist Render's IPs (or `0.0.0.0/0` for simplicity), use the connection string as `MONGO_URI`.

## Features implemented

- 4 roles (Admin, Owner, Guard, User) with distinct dashboards and JWT+RBAC guarding every route
- Mall registration with admin approval/rejection + email notifications
- Floors → Slots hierarchy with bulk slot creation and live status (available/occupied/reserved/maintenance)
- Atomic booking creation, one active booking per user, past-date/inactive-user/unapproved-mall guards
- Signed, expiring QR codes; guard scan → server-validated entry/exit, never manual approval
- Duration-based billing with late-exit penalties and GST, dummy payment gateway + invoices
- Admin, Owner, and Guard analytics (revenue trend, occupancy, peak hours, popular malls, audit log)
- Pagination/filtering/search/sorting on list endpoints; rate limiting, Helmet, Mongo sanitization

## Future improvements

Redis-backed slot-lock caching for very high concurrency, Socket.IO live slot push
updates instead of polling, Swagger/OpenAPI docs, PDF receipt generation, a live
parking map view, PWA support, and CI/CD with automated tests.
