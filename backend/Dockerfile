FROM node:18-slim as base
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Development stage
FROM base as dev
COPY . .
RUN npx prisma generate
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Production stage
FROM base as prod
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
