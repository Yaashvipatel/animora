# Animora — Pet Adoption, Rescue & Vet-Care Platform

Animora connects pet owners and adopters with adoption listings, an animal-rescue
request pipeline, vet appointment booking, and a pet-supplies shop — with an admin
side for the shelters/staff running each of those.

This README covers what's implemented right now, how to run it locally, and what's
still on the roadmap. It's written to be accurate rather than aspirational — see
"Roadmap" at the bottom for what's not built yet.

## Tech stack

- **Frontend:** Vanilla HTML/CSS/JS (no build step, no framework — open the files directly or serve with any static server)
- **Backend:** Node.js + Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (bcrypt-hashed passwords), role-based (`user` / `admin`)

## What's implemented

**Core workflows (pre-existing, verified working):**
- Signup / login (bcrypt + JWT)
- Adoption: browse listed pets, submit adoption requests, view your own requests
- Rescue: submit a rescue request with location/photo, view your own requests
- Vet care: browse doctors, book an appointment
- Shop: browse products, cart, checkout, view your own orders
- Profile completion flow

**Hardened / added in this pass:**
- **Role-based access control** — `User.role` (`user`/`admin`), carried in the JWT.
  All admin-only mutation endpoints (add/edit/delete pets, products, doctors;
  rescue status changes) now require a valid admin JWT — previously anyone could
  call them with no auth at all.
- **Admin adoption-request review** — `GET /api/adoption/requests/all` and
  `PUT /api/adoption/requests/:id/status` (admin-only) to approve/reject requests;
  approving one marks the pet as adopted. This didn't exist before.
- **Admin page guard** — every `admin-*.html` page now checks for an admin
  session on load (`admin-auth.js`) and redirects to login otherwise, and sends
  the auth token on every protected call (`adminFetch`).
- **Security middleware** — `helmet`, rate limiting (tighter on `/api/auth`),
  a hand-written NoSQL-injection sanitizer (the popular `express-mongo-sanitize`
  package is incompatible with Express 5 — it reassigns `req.query`, which
  Express 5 makes getter-only; this was caught by actually booting the server,
  not just reading the code), 1MB body size limit, CORS locked to `FRONTEND_URL`.
- **Centralized error handling** — no raw stack traces reach the client; malformed
  JSON, unknown routes (404), and unhandled errors all return clean JSON.
- **Pagination + search/filter** — `GET /api/adoption/pets` and `GET /api/products`
  now accept `page`, `limit`, `search`, and `type`/`city`/`category` query params
  and return `{ items, page, totalPages, totalResults }` instead of dumping the
  whole collection.
- **Admin bootstrapping** — `npm run create-admin` (backend) creates or promotes
  a user to admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` — there's no
  public "become admin" endpoint.
- **Admin order & appointment management** — these had *no* admin surface at all
  before (no page, no backend route). Added `GET/PUT /api/orders/all` +
  `/api/orders/:id/status`, `GET/PUT /api/appointments/all` +
  `/api/appointments/:id/status` (all admin-only, paginated, filterable by
  status), and two new pages — `admin-orders.html`, `admin-appointments.html` —
  styled to match the existing admin pages.
- **Connected admin console** — all six admin pages (`admin-adoption`,
  `admin-rescue`, `admin-doctor`, `admin-products`, `admin-orders`,
  `admin-appointments`) now share one CSS file (`admin-shared.css`) and a
  sub-nav so admins can move between them instead of landing on six isolated
  pages with no link between them.

## Getting started

```bash
cd animora-backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET at minimum
npm install
npm run dev                # starts on http://localhost:8000
```

Create an admin user:
```bash
# set ADMIN_EMAIL / ADMIN_PASSWORD in .env, then:
npm run create-admin
```

Seed demo data (dev only — these routes are not mounted when `NODE_ENV=production`):
```bash
curl -X POST http://localhost:8000/api/seed/doctors
curl -X POST http://localhost:8000/api/seed/products
```

Frontend: serve the project root with any static file server (e.g. VS Code's
"Live Server", or `npx serve .`) and open `index.html`. It talks to the backend
at `http://localhost:8000` — update the `API` constant near the top of each
page's `<script>` if you deploy the backend elsewhere.

## Environment variables

See `animora-backend/.env.example`. `MONGO_URI` and `JWT_SECRET` are required —
the server refuses to start without them rather than running with `undefined`
secrets.

## Roadmap (not yet built)

This project doesn't yet have: a marketing landing page, PDF/CSV export of
reports, an admin analytics/stats dashboard (counts, charts), automated tests,
file-upload handling (images are currently pasted as URLs), or password reset.
These are the natural next slices — happy to keep going on any of them.
