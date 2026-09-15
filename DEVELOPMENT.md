# Development Notes

## Local Setup

### Backend

```bash
cd daily-meal-gallery
sail up -d
sail artisan migrate --seed
```

### Frontend

Make sure to run `npm install` inside the `frontend/` directory, not in the repo root.

The `package.json` in the repo root is leftover from Laravel's default asset setup and is not used.

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost" > .env.local
npm run dev
```

The frontend dev server always runs at `http://localhost:5174`.

---

## Manual Integration Testing

### Get auth token

```bash
curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@dmg.com","password":"your-local-password"}'
```

### Upload test image (single photo)

```bash
curl -s -X POST http://localhost/api/meals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "photos[]=@/home/user/test.png" \
  -F "meal_type=2" \
  -F "remark=Test upload"
```

### Upload test images (multiple photos)

```bash
curl -s -X POST http://localhost/api/meals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "photos[]=@/home/user/test1.png" \
  -F "photos[]=@/home/user/test2.png" \
  -F "meal_type=2" \
  -F "remark=Test upload"
```

### Expected response

* `meal_type` should be an integer.
* `meal_type_label` should be the corresponding string (`1=breakfast`, `2=lunch`, `3=dinner`, `4=snack`).
* `photos` should be an array. Each item should contain `id`, `url`, and `thumbnail_url`.
