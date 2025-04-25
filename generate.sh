#!/bin/bash

mkdir -p certs

openssl req -nodes -new -x509 \
  -keyout certs/server.key \
  -out certs/server.cert \
  -subj "/C=FR/ST=Paris/L=Paris/O=42_transcendance/CN=localhost" \
  -days 365