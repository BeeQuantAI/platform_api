FROM node:alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000

ENV DB_HOST=bqCore

CMD ["yarn", "start"]
