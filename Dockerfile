FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache go

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache go nginx

WORKDIR /app

COPY --from=builder /app/dist dist
COPY --from=builder /app/server server
COPY --from=builder /app/package*.json ./
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY start.sh /start.sh

RUN npm install -g tsx && npm ci --omit=dev

RUN chmod +x /start.sh

EXPOSE 3000 3001

CMD ["/start.sh"]
