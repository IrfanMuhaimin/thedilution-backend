FROM node:18-alpine

# Install netcat (nc) for the healthcheck script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Set an environment variable
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install

COPY . .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

# The default command to run
CMD ["npm", "start"]