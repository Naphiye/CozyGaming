FROM node:20-bullseye AS builder

RUN apt update -y && apt install -y

WORKDIR /backend
# a partir de mnt on se situe dans le dossier backend
COPY ./package-lock.json ./package-lock.json
COPY ./package.json ./package.json
RUN npm ci

COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json
RUN npm run build

# Stage 2 : prod
FROM node:20-bullseye
WORKDIR /backend

COPY ./package-lock.json ./package-lock.json
COPY ./package.json ./package.json
RUN npm ci --production
COPY ./.env ./.env
COPY ./src ./src

COPY --from=builder /backend/dist ./dist
ENV NODE_ENV=production

EXPOSE 3000
# pas de --host car fastify ecoute deja sur 3000 et il est dans docker compose declare en tant que port
CMD [ "npm", "run", "prod" ]