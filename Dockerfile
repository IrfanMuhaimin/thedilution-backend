# Use an official Node.js runtime as a parent image
# Using a specific version is a good practice (e.g., 18-alpine for a small, secure base)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This is a Docker best practice to leverage layer caching.
# If these files don't change, the 'npm install' step won't run again.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application's source code from your computer to the container
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run your app
# This will execute 'node app.js' when the container launches
CMD ["node", "app.js"]