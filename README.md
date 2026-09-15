# Daily Meal Gallery

A photo diary for logging daily meals, built with Laravel 11 + React + PostgreSQL + Cloudinary.

**Live Demo**: https://daily-meal-gallery.vercel.app

---

## Requirements

- Docker Desktop (running)
- WSL2 with Ubuntu

## Getting Started
```bash
git clone https://github.com/CollinWeightman/daily-meal-gallery.git
cd daily-meal-gallery
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed
```

For frontend setup and manual testing, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Daily Start
```bash
wsl -d Ubuntu
cd ~/workplace/daily-meal-gallery
./vendor/bin/sail up -d
cd frontend && npm run dev
```

## Run Tests
```bash
./vendor/bin/sail php ./vendor/bin/pest
```

## Open in Editor
```bash
cd ~/workplace/daily-meal-gallery
cursor .    # Cursor
code .      # VSCode
```

## Stop
```bash
./vendor/bin/sail down
```

---

## Deployment

| Service  | Platform  | URL |
|----------|-----------|-----|
| Frontend | Vercel    | https://daily-meal-gallery.vercel.app |
| Backend  | Render    | https://daily-meal-gallery.onrender.com |
| Database | Supabase  | - |
| Images   | Cloudinary | - |

Backend is hosted on Render free tier and will sleep after 15 minutes of inactivity. First request may take 30–60 seconds. The database is hosted on Supabase free tier and pauses after 7 days of inactivity. If you see a database error on first load, it may take a bit longer to resume. The app will show a notice if either is slow to respond.

## Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — local setup and manual testing
- [API.md](API.md) — full API reference