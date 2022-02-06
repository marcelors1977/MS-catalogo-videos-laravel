FROM php:7.3.6-fpm-alpine3.9

WORKDIR /var/www

RUN apk add --no-cache shadow openssl bash mysql-client nodejs npm git
RUN docker-php-ext-install pdo pdo_mysql

RUN touch /home/www-data/.bashrc | echo "PS1='\w\$ '" >> /home/www-data/.bashrc

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . /var/www

RUN usermod -u 1000 www-data

RUN composer install && \
    php artisan config:cache 
    # && \
    # chmod -R 777 storage

RUN rm -rf /var/www/html && ln -s public html

USER www-data

EXPOSE 9000
