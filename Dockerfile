FROM node:22-alpine AS builder
WORKDIR /build
COPY lang/ lang/
COPY template.html .
COPY build.js .
COPY html/ html/
RUN node build.js

FROM nginx:alpine
COPY --from=builder /build/html/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
