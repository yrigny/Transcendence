# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app code and public assets
COPY . .

# Run script creating the http certificate and key
RUN chmod +x generate.sh && ./generate.sh

RUN npx tsc

# Expose port (adjust if your app uses a different one)
EXPOSE 6789 6788

# Run the app
CMD ["npm", "run", "dev"]
