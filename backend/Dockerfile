# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Install all dependencies including devDependencies for tsc
RUN npm install --include=dev
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install both dependencies and devDependencies to ensure ts-node works for seeding
RUN npm install --include=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY tsconfig.json ./
EXPOSE 5000

# Use a shell script to seed then start
RUN echo '#!/bin/sh\nnpm run seed\nnode dist/index.js' > start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]
