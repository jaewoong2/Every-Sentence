# Use an intermediate build stage to include the .env file
FROM node:18-alpine as builder
WORKDIR /usr/src/app
COPY .env .

# Final stage
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.env .
# Your application setup continues here...

FROM node:18-alpine AS base

# INSTALL DEPENDENCIES FOR DEVELOPMENT (FOR NEST)
FROM base AS deps
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci

USER node

# INSTALL DEPENDENCIES & BUILD FOR PRODUCTION
FROM base AS build
WORKDIR /usr/src/app

COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build

CMD [ "node", "dist/main.js" ]