# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Install dependencies
RUN npm install pm2 -g
RUN npm install serve -g
RUN npm install yarn -g

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run your app using npm start
CMD ["./deploy.sh"]