FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

RUN pnpm install

COPY src ./src

EXPOSE 3000

CMD ["node_modules/.bin/nest", "start", "--watch"]
