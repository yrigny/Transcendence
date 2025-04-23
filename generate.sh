#!/bin/bash

mkdir -p certs

openssl req -nodes -new -x509 \
  -keyout certs/server.key \
  -out certs/server.cert \
  -subj "/C=FR/ST=Local/L=Local/O=Dev/CN=localhost" \
  -days 365