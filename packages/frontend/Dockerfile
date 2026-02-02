FROM node:20-bullseye AS builder

WORKDIR /frontend

COPY ./package-lock.json ./package-lock.json
COPY ./package.json ./package.json
RUN npm ci

COPY ./config/vite.prod.config.js ./vite.config.js
COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src
COPY ./public ./public
COPY ./index.html ./index.html
RUN npm run build

FROM nginx:alpine

COPY --from=builder /frontend/dist /usr/share/nginx/html
COPY ./config/nginx.prod.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]