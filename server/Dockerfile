# Use official Node.js 20 image
FROM node:20

# Puppeteer/Chrome dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  wget \
  ca-certificates \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libasound2 \
  libxshmfence1 \
  libgbm1 \
  libxss1 \
  libxtst6 \
  libxi6 \
  libxcursor1 \
  libxinerama1 \
  libxfixes3 \
  libgl1 \
  libdbus-1-3 \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Puppeteer will use the system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app
COPY . .

RUN npm install --production

CMD ["node", "app.js"]
