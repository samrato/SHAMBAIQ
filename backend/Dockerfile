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
CMD ["sh", "-c", "node dist/seed.js && exec node dist/index.js"]
