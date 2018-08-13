FROM keymetrics/pm2:latest-alpine

RUN mkdir -p /usr/app

WORKDIR /usr/app

# Bundle APP files
COPY src src/
COPY package.json .
COPY support/pm2.json ./support/pm2.json


# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Expose the listening port of your app
EXPOSE 7001

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-docker", "support/pm2.json" ]
