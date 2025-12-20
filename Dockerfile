FROM node:18-alpine

# This Dockerfile is for Railway/Render to build the BACKEND from the root
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./

# Install Dependencies
RUN npm install

# Copy backend source code
COPY backend/ .

# Expose API Port
EXPOSE 3000

# Start Server
CMD ["node", "server.js"]
