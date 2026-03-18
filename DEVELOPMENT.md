# Development Notes

## Manual Integration Testing

### Get auth token
```bash
curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@dmg.com","password":"root"}'
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

### Upload test image (multiple photos)
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
- `meal_type` should be an integer
- `meal_type_label` should be the corresponding string (1=breakfast, 2=lunch, 3=dinner, 4=snack)
- `photos` should be an array, each item contains `id`, `url`, `thumbnail_url`