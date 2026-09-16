FROM php:8.3-apache

# Working Directory
WORKDIR /var/www/html

# Install Linux packages & PHP Extensions required by Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    dos2unix \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite and mod_headers
RUN a2enmod rewrite headers

# Copy project files
COPY . /var/www/html

# Ensure .env exists and generate key during build
RUN cp /var/www/html/laravel/.env.example /var/www/html/laravel/.env \
    && chown www-data:www-data /var/www/html/laravel/.env \
    && chmod 664 /var/www/html/laravel/.env

# Install Composer PHP dependencies & generate app key
RUN cd /var/www/html/laravel \
    && composer install --no-dev --optimize-autoloader --no-interaction \
    && php artisan key:generate --force

# Set Apache DocumentRoot to Laravel public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/laravel/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configure directory overrides in Apache
RUN printf '<Directory /var/www/html/laravel/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

# Prepare storage directories and set proper permissions
RUN mkdir -p /var/www/html/laravel/storage/framework/cache/data \
    && mkdir -p /var/www/html/laravel/storage/framework/sessions \
    && mkdir -p /var/www/html/laravel/storage/framework/views \
    && mkdir -p /var/www/html/laravel/storage/logs \
    && mkdir -p /var/www/html/laravel/public/uploads \
    && chown -R www-data:www-data /var/www/html/laravel/storage /var/www/html/laravel/bootstrap/cache /var/www/html/laravel/public/uploads \
    && chmod -R 775 /var/www/html/laravel/storage /var/www/html/laravel/bootstrap/cache /var/www/html/laravel/public/uploads

# Setup entrypoint with dos2unix
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80 3000 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
