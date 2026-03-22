# API Reference

Base URL: `https://daily-meal-gallery.onrender.com/api`

All requests should include `Accept: application/json`.  
Authenticated endpoints require `Authorization: Bearer {token}`.

---

## Authentication

### POST /login
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{ "token": "string" }
```

### POST /logout
Requires authentication.  
Invalidates the current token.

---

## Meals

### GET /meals
List meals with optional filters.

**Query Parameters**

| Parameter  | Type    | Description                        |
|------------|---------|------------------------------------|
| meal_type  | integer | 1=breakfast 2=lunch 3=dinner 4=snack |
| year       | integer | Filter by year                     |
| month      | integer | Filter by month                    |
| page       | integer | Page number (default: 1)           |
| per_page   | integer | Items per page (default: 20)       |

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "meal_type": 1,
      "meal_type_label": "breakfast",
      "photos": [
        {
          "id": 1,
          "url": "https://...",
          "thumbnail_url": "https://..."
        }
      ],
      "remark": null,
      "taken_at": "2026-03-18T12:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "total": 60
  }
}
```

---

### GET /meals/{id}
Get a single meal.

**Response 200** — same shape as a single item in `GET /meals`

---

### POST /meals
Requires authentication.  
Upload a new meal with one or more photos.

**Request** `multipart/form-data`

| Field      | Type             | Required | Description               |
|------------|------------------|----------|---------------------------|
| photos[]   | file (image)     | Yes      | 1–5 photos, max 5MB each  |
| meal_type  | integer          | Yes      | 1–4                       |
| remark     | string           | No       |                           |
| taken_at   | datetime         | No       | ISO 8601                  |

**Response 201** — created meal object

---

### PATCH /meals/{id}
Requires authentication.  
Partial update of meal metadata.

**Request** `application/json`

| Field      | Type     | Description  |
|------------|----------|--------------|
| meal_type  | integer  | 1–4          |
| remark     | string   |              |
| taken_at   | datetime | ISO 8601     |

**Response 200** — updated meal object

---

### DELETE /meals/{id}
Requires authentication.  
Deletes the meal and all associated photos from Cloudinary.

**Response 204** No content

---

### GET /meals/available-filters
Returns years and months that have meal data.

**Response 200**
```json
{
  "years": [
    { "year": 2026, "months": [1, 2, 3] },
    { "year": 2025, "months": [10, 11, 12] }
  ]
}
```

---

## Admin

### GET /admin/dashboard
Requires authentication.

**Response 200**
```json
{
  "total": 120,
  "by_type": {
    "breakfast": 30,
    "lunch": 40,
    "dinner": 35,
    "snack": 15
  }
}
```

---

### GET /admin/cloudinary-usage
Requires authentication.  
Cached for 10 minutes.

**Response 200**
```json
{
  "credits": { "usage": 1.2, "limit": 25 },
  "storage": { "usage": 512000000, "limit": 25000000000 },
  "requests": { "usage": 3200, "limit": 500000 },
  "bandwidth": { "usage": 1024000, "limit": 25000000000 }
}
```