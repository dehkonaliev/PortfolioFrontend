FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Override the dev .env so the production build talks to the backend via the
# nginx proxy (same origin /api). Railway can pass their own ARG values.
ARG VITE_BACKEND_URL=/api
ARG VITE_CREATED_BY_LINK=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_CREATED_BY_LINK=$VITE_CREATED_BY_LINK
RUN npm run build

FROM nginx:alpine
ENV BACKEND_HOST=https://portfoliobackend-md.up.railway.app

# nginx.conf.template uses ${BACKEND_HOST}; the nginx image substitutes
# environment variables from /etc/nginx/templates on startup.
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80