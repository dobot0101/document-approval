FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
COPY . .
# RUN npm run build
# CMD npm start
CMD npm run dev
EXPOSE 3000