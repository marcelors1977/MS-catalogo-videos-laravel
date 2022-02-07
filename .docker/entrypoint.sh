#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh
# chown -R www-data:www-data .
cp .env.example .env
cp .env.testing.example .env.testing
composer install
# composer install --no-interaction --prefer-dist --optimize-autoloader -d /var/www
php artisan config:cache 
php artisan key:generate
php artisan migrate

php-fpm
