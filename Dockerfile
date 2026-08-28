FROM node:20-alpine AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_PATH=/

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/frontend/dist ./dist
COPY server.js ./server.js

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
