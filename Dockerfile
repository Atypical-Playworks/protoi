FROM node:18-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .

ARG GOOGLE_GENERATIVE_AI_API_KEY
ENV GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY

RUN pnpm run build

RUN pnpm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]