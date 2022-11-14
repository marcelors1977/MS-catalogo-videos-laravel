#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh

###FRONT-END
npm config set cache /var/www/.npm-cache --global
cd /var/www/frontend && npm install && cd ..

###BACK-END
cd backend
# if [ ! -f ".env"]; then
    cp .env.example .env
# fi
# if [ ! -f ".env.testing"]; then
    cp .env.testing.example .env.testing
# fi
cp .env.dusk.testing.example .env.dusk.testing
composer install
# composer install --no-interaction --prefer-dist --optimize-autoloader -d /var/www
php artisan config:cache 
php artisan key:generate
php artisan migrate

chromedriver &
php-fpm
