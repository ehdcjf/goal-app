FROM node:16     

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

ARG DEFAULT_PORT=3000

ENV PORT $DEFAULT_PORT

EXPOSE $PORT

CMD ["yarn" ,"start:dev"]
