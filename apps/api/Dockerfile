FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace manifests first — layer cache busts only on lockfile changes
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared packages before install so workspace links resolve
COPY packages/ ./packages/

# Copy app manifest separately so install layer is cached independently of source
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/nest-cli.json ./apps/api/
COPY apps/api/src ./apps/api/src

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node_modules/.bin/nest", "start", "--watch"]
