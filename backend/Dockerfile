FROM node:18-bullseye

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
# We need build tools for better-sqlite3 just in case
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
