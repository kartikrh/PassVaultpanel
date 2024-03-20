# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./
COPY yarn*.lock ./

# Install dependencies
RUN yarn install
RUN npm install --global serve

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run your app using npm start
RUN npm run build
CMD serve -s build
