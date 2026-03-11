# Development Notes

## Manual Integration Testing

### Get auth token
```bash
curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@dmg.com","password":"root"}'
```

### Upload test image
```bash
curl -s -X POST http://localhost/api/meals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "photo=@/home/user/test.png" \
  -F "meal_type=2" \
  -F "remark=Test upload"
```

### Expected response
- `meal_type` should be an integer
- `meal_type_label` should be the corresponding string (1=breakfast, 2=lunch, 3=dinner, 4=snack)
- `cloudinary_url` and `thumbnail_url` should be valid Cloudinary URLs