# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency catalogs
COPY package.json package-lock.json ./

# Install packages
RUN npm ci

# Copy application source code
COPY . .

# Build assets using Vite compiler
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration for single page app routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build folder from compile container to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (matches ALB task routing configuration)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
