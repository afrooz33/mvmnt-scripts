FROM node:20-slim AS builder

WORKDIR /usr/src/app

ENV NODE_OPTIONS=--max_old_space_size=2048

COPY package*.json ./

RUN npm install glob rimraf
RUN npm i

COPY . .

ENV NODE_ENV production
RUN npm run build

FROM node:20-slim AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app
RUN mkdir -p uploads/zendesk_attachments

# Install FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/src ./src

ARG AUTH_PRIVATE_KEY=""
RUN echo $AUTH_PRIVATE_KEY > private.pem
RUN chmod 600 private.pem

CMD ["npm", "run", "start:prod"]
