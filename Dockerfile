FROM php:8.4-fpm-alpine

# 安裝系統依賴
RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    curl

# 安裝 PHP 擴展
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# 安裝 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 設定工作目錄
WORKDIR /var/www

# 複製專案檔案
COPY . .

# 安裝 PHP 依賴
RUN composer install --optimize-autoloader --no-dev --no-interaction

# 設定權限
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# 複製設定檔
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 開放 port
EXPOSE 10000

# 啟動腳本
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]