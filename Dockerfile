FROM node:12 as node

ARG CONTEXT
ARG ID
ARG URL
ARG COMPONENTS

RUN test -n "$CONTEXT"
RUN test -n "$ID"
RUN test -n "$URL"
RUN test -n "$COMPONENTS"

ENV REACT_APP_CONTEXT=$CONTEXT
ENV REACT_APP_ID=$ID
ENV REACT_APP_URL=$URL
ENV REACT_APP_COMPONENTS=$COMPONENTS

WORKDIR /ontographer
COPY package.json .
RUN npm install --production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=node /ontographer/build /usr/share/nginx/html