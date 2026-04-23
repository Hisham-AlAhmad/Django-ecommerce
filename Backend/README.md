# Backend README

## Overview

This backend is a Django + Django REST Framework API for the DigitalHub e-commerce app. It provides authentication, products, cart, orders, contact messages, and published testimonials.

## Tech Stack

- Python 3.11+
- Django 5.2
- Django REST Framework
- Simple JWT (`djangorestframework-simplejwt`)
- django-filter
- SQLite (default)

## Environment Variables

This project currently relies on Django settings directly. For local development, the main values are configured in [core/settings.py](core/settings.py).

Recommended overrides for production:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- DB connection settings (if moving beyond SQLite)
- CORS origin settings

## Run Locally

1. Create and activate virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run migrations:
   - `python manage.py migrate`
4. Start server:
   - `python manage.py runserver`

API base URL in local dev:

- `http://localhost:8000/api/`

## Seed Demo Data

A complete seed command is provided.

Run seed:

- `python manage.py seed_data`

Run with reset:

- `python manage.py seed_data --reset`

Use custom password:

- `python manage.py seed_data --password "YourPass123!"`

The seed includes:

- Demo users
- Product categories and products
- User addresses
- Cart + cart items
- Orders + order items
- Contact messages
- Published testimonials

## API Endpoints

### Auth / Users

- `POST /api/users/register/`
- `POST /api/users/login/`
- `POST /api/users/token/refresh/`
- `POST /api/users/logout/`
- `GET|PATCH /api/users/profile/`
- `GET|POST /api/users/addresses/`
- `GET|PATCH|DELETE /api/users/addresses/{id}/`

### Products

- `GET /api/products/`
- `GET /api/products/categories/`
- `GET /api/products/{slug}/`

### Cart

Requires JWT auth.

- `GET /api/cart/`
- `POST /api/cart/` (body: `product_id`, `quantity`)
- `PATCH /api/cart/items/{item_id}/` (body: `quantity`)
- `DELETE /api/cart/items/{item_id}/`

### Orders

Requires JWT auth.

- `POST /api/orders/checkout/` (body: `street`, `city`, `country`)
- `GET /api/orders/`
- `GET /api/orders/{id}/`

### Contact + Testimonials

- `POST /api/contact/` (public contact form)
- `GET /api/testimonials/` (public, published-only testimonials)

## Notes

- Testimonials are sourced from `ContactMessage` records where `is_published=True`.
- Cart logic supports server cart only on backend; guest cart is handled at frontend data layer then merged after login.
