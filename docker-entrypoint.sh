#!/bin/bash

# Ensure .env file exists in container for Laravel
if [ ! -f /var/www/html/laravel/.env ]; then
    echo "Creating .env from .env.example..."
    cp /var/www/html/laravel/.env.example /var/www/html/laravel/.env
fi

cd /var/www/html/laravel

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ]; then
    echo "Generating Application Key..."
    php artisan key:generate --force || true
fi

# Configure Apache port: Listen on 80, 3000, 8080, and $PORT for Railway compatibility
PORT="${PORT:-8080}"
echo "Configuring Apache to listen on 80, 3000, 8080, and $PORT..."
printf "Listen 80\nListen 3000\nListen 8080\n" > /etc/apache2/ports.conf
if [ "$PORT" != "80" ] && [ "$PORT" != "3000" ] && [ "$PORT" != "8080" ]; then
    echo "Listen ${PORT}" >> /etc/apache2/ports.conf
fi

cat <<EOF > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80 *:3000 *:8080 *:${PORT}>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/laravel/public

    <Directory /var/www/html/laravel/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

# Clear config and route cache for fresh runtime variables
php artisan config:clear || true
php artisan route:clear || true

# Run database schema auto-init asynchronously in background so Apache boots instantly
(
    sleep 3
    echo "Running background database verification..."
    php artisan portal:init-db || true
) &

echo "=== BSM Portal Backend starting Apache on ports 80, 8080, and $PORT ==="
exec apache2-foreground
