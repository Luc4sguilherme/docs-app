FROM node:16

WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN chown -R node /usr/app
USER node
RUN npm run build

FROM nginx:mainline-alpine

COPY --from=0 /usr/app/dist ./var/www/html
EXPOSE 80