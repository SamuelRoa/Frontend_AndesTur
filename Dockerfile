# Stage 1: Compilar la aplicación React con Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Habilitar pnpm si es necesario o usar npm
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
