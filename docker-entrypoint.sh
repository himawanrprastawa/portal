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

# Configure Apache port dynamically based on Railway $PORT (default 8080)
PORT="${PORT:-8080}"
echo "Configuring Apache to listen on port $PORT..."
echo "Listen ${PORT}" > /etc/apache2/ports.conf

cat <<EOF > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:${PORT}>
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

# Initialize database schema and initial data if DB_HOST is present
if [ -n "$DB_HOST" ]; then
    echo "Attempting database initialization on $DB_HOST..."
    php artisan portal:init-db || true
fi

# Clear config and route cache for fresh runtime variables
php artisan config:clear || true
php artisan route:clear || true

echo "=== BSM Portal Backend is running on port $PORT ==="
exec apache2-foreground
