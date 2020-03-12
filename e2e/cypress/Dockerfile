FROM cypress/base:12.16.1

WORKDIR /app

ENV CI=1
RUN npm install -g yarn
RUN yarn install --pure-lock-file
