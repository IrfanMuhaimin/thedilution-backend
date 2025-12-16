FROM node:18-alpine

# --- START: PYTHON INSTALLATION ---
# Install Python 3 and pip (the Python package installer)
# python3-dev and build-base are needed to compile some Python packages
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Copy your requirements file into the app directory
COPY requirements.txt ./

# Install the Python dependencies listed in requirements.txt
# We add --break-system-packages to comply with PEP 668 in newer pip versions
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages
# --- END: PYTHON INSTALLATION ---

# Install netcat (nc) for the healthcheck script (This is from your original file)
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
CMD ["npm", "run", "dev"]