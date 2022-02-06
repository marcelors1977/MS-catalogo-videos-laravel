#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh
cp .env.example .env
cp .env.testing.example .env.testing
chown -R www-data:www-data .
# composer install
composer install --no-interaction --prefer-dist --optimize-autoloader -d /var/www
php artisan config:cache 
php artisan key:generate
php artisan migrate

php-fpm
