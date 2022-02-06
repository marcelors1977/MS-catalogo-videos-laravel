#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh
cp .env.example /var/www/.env
cp .env.testing.example /var/www/.env.testing
chown -R www-data:www-data /var/www/
composer install
php artisan key:generate
php artisan migrate

php-fpm
