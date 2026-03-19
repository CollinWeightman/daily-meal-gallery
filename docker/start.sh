#!/bin/sh

php artisan config:cache
php artisan route:cache
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder --force

php-fpm -D
nginx -g "daemon off;"