FROM oven/bun:1.3.14 AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json

RUN bun install --frozen-lockfile

FROM dependencies AS build

COPY server server

RUN bun --cwd server run build

FROM oven/bun:1.3.14 AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=bun:bun /app/server/dist ./dist

USER bun
EXPOSE 3333

CMD ["bun", "dist/server.js"]

