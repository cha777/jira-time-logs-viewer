FROM node:lts-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

ENV PORT=3000
ENV NODE_ENV=production

CMD [ "npm", "run", "start" ]

EXPOSE ${PORT}