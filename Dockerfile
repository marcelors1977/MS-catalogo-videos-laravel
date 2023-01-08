FROM php:7.3.33-fpm-alpine3.15

WORKDIR /var/www

RUN apk add --no-cache shadow \
    openssl \
    bash \
    mysql-client \
    nodejs \
    npm \
    git \
    libzip-dev \
    chromium-chromedriver
RUN docker-php-ext-install pdo pdo_mysql zip bcmath sockets

RUN wget -q -O /usr/bin/wait-for https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for && \
    chmod +x /usr/bin/wait-for

RUN touch /home/www-data/.bashrc | echo "PS1='\w\$ '" >> /home/www-data/.bashrc

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . /var/www

RUN usermod -u 1000 www-data 

# RUN composer install --no-interaction --prefer-dist --optimize-autoloader -d /var/www && \
# RUN composer install && \
    # php artisan config:cache 
#     # && \
#     # chmod -R 777 storage

RUN rm -rf /var/www/html && ln -s public html

USER www-data

EXPOSE 9000
