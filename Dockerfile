# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app code and public assets
COPY . .

# Expose port (adjust if your app uses a different one)
EXPOSE 6789

# Run the app
CMD ["npm", "run", "dev"]
