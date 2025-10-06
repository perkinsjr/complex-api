FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

EXPOSE 3000

CMD ["node", "dist/index.js"]
