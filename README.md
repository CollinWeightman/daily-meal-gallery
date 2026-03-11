# Daily Meal Gallery

A photo diary for logging daily meals, built with Laravel 11 + React + PostgreSQL + Cloudinary.

## Requirements

- Docker Desktop (running)
- WSL2 with Ubuntu

## Getting Started

```bash
git clone https://github.com/your-account/daily-meal-gallery.git
cd daily-meal-gallery
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed
```

## Daily Start

```bash
wsl -d Ubuntu
cd ~/workplace/daily-meal-gallery
./vendor/bin/sail up -d
```

## Run Tests

```bash
./vendor/bin/sail php ./vendor/bin/pest
```

For manual integration testing, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Open in Editor
```bash
# In WSL Ubuntu terminal
cd ~/workplace/daily-meal-gallery
cursor .    # Cursor
code .      # VSCode
```

## Stop

```bash
./vendor/bin/sail down
```