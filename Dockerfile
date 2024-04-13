FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY yarn.lock package.json ./
RUN yarn --immutable

# run backend
COPY . .
RUN yarn run build


EXPOSE 3000
CMD [ "yarn", "start" ]