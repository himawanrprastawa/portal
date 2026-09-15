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

# Configure Apache port: Listen on $PORT (default 8080) and 8080
PORT="${PORT:-8080}"
echo "Configuring Apache to listen on port $PORT..."
if [ "$PORT" = "8080" ]; then
    echo "Listen 8080" > /etc/apache2/ports.conf
else
    printf "Listen ${PORT}\nListen 8080\n" > /etc/apache2/ports.conf
fi

cat <<EOF > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:* >
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/laravel/public

    <Directory /var/www/html/laravel/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /dev/stderr
    CustomLog /dev/stdout combined
</VirtualHost>
EOF

# Test Apache configuration
apache2ctl -t

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
