FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=stage
ARG VITE_BASE_PATH=/
ARG VITE_ENABLE_DEV_LOGIN=false
ARG VITE_ALLOW_DEV_CODE_HINT=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_ENABLE_DEV_LOGIN=$VITE_ENABLE_DEV_LOGIN
ENV VITE_ALLOW_DEV_CODE_HINT=$VITE_ALLOW_DEV_CODE_HINT

RUN npm run build

FROM nginx:1.27-alpine

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
