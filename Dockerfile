FROM node:22-alpine AS build
WORKDIR /app/server
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server/dist ./dist
COPY data ./data
EXPOSE 4000
CMD ["node", "dist/index.js"]
