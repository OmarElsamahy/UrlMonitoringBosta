# Use an official Node.js runtime as a parent image
FROM node:12-alpine

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Set the command to run when the container starts
CMD ["npm", "start"]
