FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install

FROM deps AS dev

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM deps AS build

ARG VITE_API_BASE_URL=/api
ARG VITE_WS_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

COPY . .
RUN npm run build

FROM alpine:3.20 AS static

WORKDIR /app
COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "mkdir -p /usr/share/nginx/html && cp -r /app/dist/. /usr/share/nginx/html && tail -f /dev/null"]
