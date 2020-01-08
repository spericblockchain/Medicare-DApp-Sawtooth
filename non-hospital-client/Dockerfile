FROM ubuntu:xenial
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y -q curl
RUN curl -sl https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs
RUN echo "deb http://repo.sawtooth.me/ubuntu/ci xenial universe" >> /etc/apt/sources.list \
 && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8AA7AF1F1091A5FD \
 && echo "deb http://repo.sawtooth.me/ubuntu/1.0/stable xenial universe" >> /etc/apt/sources.list \
 && apt-get update \
 && apt-get install -y -q --no-install-recommends \
    apt-utils \
 && apt-get install -y -q \
    build-essential \
    apt-transport-https \
    ca-certificates \
    python3-sawtooth-cli \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /prm/non-hospital-client
CMD npm install && npm start
EXPOSE 3000
