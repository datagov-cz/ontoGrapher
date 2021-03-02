FROM node:12 as node

ARG PUBLIC_PATH=.
ENV PUBLIC_URL=${PUBLIC_PATH}

WORKDIR /ontographer
COPY package.json .
RUN npm install --production
COPY . .
RUN npx eslint --ext .ts,.tsx ./src/
RUN npm run build

FROM docker.pkg.github.com/opendata-mvcr/react-nginx/react-nginx:latest
COPY --from=node /ontographer/build /usr/share/nginx/html
