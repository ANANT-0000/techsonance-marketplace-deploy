# ---------- Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# ---------- Builder ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 👇 DECLARE THE ARGUMENTS HERE SO THE COMPILER CAN SEE THEM
# ARG NEXT_PUBLIC_API_URL
# ARG NEXT_PUBLIC_VENDOR_AUTH_URL
# ARG NEXT_PUBLIC_CUSTOMER_AUTH_URL
# ARG NEXT_PUBLIC_ADMIN_AUTH_URL
# ARG NEXT_PUBLIC_VENDOR_BASE_URL
# ARG NEXT_PUBLIC_USER_BASE_URL
# ARG NEXT_PUBLIC_ADMIN_BASE_URL

# Next.js reads these system ENV variables during compilation to bake them into the JS files
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_VENDOR_AUTH_URL=$NEXT_PUBLIC_VENDOR_AUTH_URL
# ENV NEXT_PUBLIC_CUSTOMER_AUTH_URL=$NEXT_PUBLIC_CUSTOMER_AUTH_URL
# ENV NEXT_PUBLIC_ADMIN_AUTH_URL=$NEXT_PUBLIC_ADMIN_AUTH_URL
# ENV NEXT_PUBLIC_VENDOR_BASE_URL=$NEXT_PUBLIC_VENDOR_BASE_URL
# ENV NEXT_PUBLIC_USER_BASE_URL=$NEXT_PUBLIC_USER_BASE_URL
# ENV NEXT_PUBLIC_ADMIN_BASE_URL=$NEXT_PUBLIC_ADMIN_BASE_URL
# RUN npm run build

# ---------- Runner ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000

CMD ["npm", "start"]