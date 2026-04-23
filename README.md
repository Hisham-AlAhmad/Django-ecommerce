# DigitalHub Django E-commerce

## Project Overview

DigitalHub is a full-stack e-commerce project with:

- Django REST backend API
- React + Vite frontend client

The app supports product browsing, JWT authentication, dual-mode cart behavior (guest/local + authenticated/server), order checkout, contact form submissions, and published testimonials.

## Architecture

- `Backend/`
  - Django project (`core`) and domain apps (`users`, `products`, `cart`, `orders`, `contact`)
- `Frontend/`
  - React app with route-based pages/components and shared API client

Data flow summary:

1. Frontend calls backend via `VITE_API_URL`.
2. Auth uses JWT access/refresh tokens.
3. Guest users store cart locally.
4. On login/register, guest cart is merged into server cart.
5. Checkout uses server-side cart and order endpoints.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

## Setup Instructions

### 1) Backend setup

1. `cd Backend`
2. Create and activate virtual environment
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. Optional demo data seed:
   - `python manage.py seed_data --reset`
6. `python manage.py runserver`

Backend runs on:

- `http://localhost:8000`

### 2) Frontend setup

1. `cd Frontend`
2. `npm install`
3. Configure `.env` (see below)
4. `npm run dev`

Frontend runs on:

- `http://localhost:5173`

## Environment Variables

### Frontend (`Frontend/.env`)

Required:

- `VITE_API_URL` (example: `http://localhost:8000/api`)
- `VITE_IMG_URL` (example: `http://localhost:5173/img`)

Important:

- Keep env values clean (no inline comments after the value), for example:
  - `VITE_API_URL=http://localhost:8000/api`

### Backend

Currently configured in [Backend/core/settings.py](Backend/core/settings.py).

Key settings to review for production:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- database engine/credentials

## Feature Notes

- Testimonials endpoint: `GET /api/testimonials/` returns published-only entries.
- Dual cart strategy:
  - logged out: localStorage guest cart
  - logged in: server cart API
  - auto merge on login/register/session restore
- Token refresh retry:
  - on 401, frontend refreshes access token with refresh token and retries once
  - on refresh failure, auth state is cleared and user is redirected to login

## Running Demo Quickly

1. Start backend and run seed:
   - `python manage.py migrate`
   - `python manage.py seed_data --reset`
   - `python manage.py runserver`
2. Start frontend:
   - `npm install`
   - `npm run dev`
3. Log in with seeded users listed by the seed command output.
