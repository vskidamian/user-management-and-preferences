FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json ./
COPY vite.config.ts tsconfig.json index.html ./

RUN pnpm install

COPY src ./src

EXPOSE 5173

CMD ["node_modules/.bin/vite", "--host", "0.0.0.0"]
