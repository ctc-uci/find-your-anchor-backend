FROM node:16.15.0-alpine

# Set working dir
WORKDIR /app

# Copies package.json and yarn.lock to Docker environment
COPY package.json .
COPY yarn.lock .

# Installs all node packages
RUN yarn install --production

# Copies everything over to Docker environment
COPY . .

# Uses port which is used by the actual application
EXPOSE 3001

# Finally runs the application
CMD [ "yarn", "start" ]

# Start container with: docker run -it --rm -p <outside port>:3001 --env-file ./.env -v ${PWD}/firebase-adminsdk.json:/app/firebase-adminsdk.json <image name>
