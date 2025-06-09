FROM node:20

# Install Chromium manually
RUN apt update && apt install -y chromium

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "app.js"]
