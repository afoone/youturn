FROM node:18-bookworm
# Instalar Java en un solo layer y limpiar cache de apt


# Crear directorios
WORKDIR /usr/src/app
RUN mkdir -p server frontend

# Copiar package.json primero para aprovechar cache
COPY ./server/package.json ./server/
COPY ./frontend/package.json ./frontend/

RUN cd /usr/src/app/frontend && npm install
RUN cd /usr/src/app/server && npm install

# bundle app source
COPY ./server ./server

# bundle app source for angular
COPY ./frontend ./frontend
RUN cd /usr/src/app/frontend && npm run build:test
RUN rm -rf /usr/src/app/frontend/

# Create user and group no-root
# RUN groupadd -r appuser && useradd -r -g appuser -d /usr/src/app appuser

# change ownership of the app directory
# RUN chown -R appuser:appuser /usr/src/app

# switch to non-root user
# USER appuser

WORKDIR /usr/src/app/server
# run the app
CMD ["npm", "run", "start:tst"]
EXPOSE 3000
