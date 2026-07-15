# Build React app
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_ENABLE_MOCK_DATA=false

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_ENABLE_MOCK_DATA=$REACT_APP_ENABLE_MOCK_DATA

RUN npm run build:prod

# Serve with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]