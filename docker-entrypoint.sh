#!/bin/bash
set -e

# Railway dynamically injects $PORT (default to 8080 if not set)
PORT="${PORT:-8080}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
sed -i "s/8080/${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true
sed -i "s/:8080/:${PORT}/g" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true

echo "=== Starting BSM Operations Portal backend on port $PORT ==="

cd /var/www/html/laravel

# Generate APP_KEY if not already set in environment
if [ -z "$APP_KEY" ]; then
    echo "Generating temporary application key..."
    php artisan key:generate --force
fi

# Run database auto-migration and seeding if database host is configured
if [ -n "$DB_HOST" ]; then
    echo "Configuring and migrating database on $DB_HOST:$DB_PORT..."
    php artisan portal:init-db || true
fi

# Clear any cached configuration to use runtime environment variables
php artisan config:clear
php artisan route:clear

echo "=== Apache HTTP Server is ready to handle requests ==="
exec apache2-foreground
