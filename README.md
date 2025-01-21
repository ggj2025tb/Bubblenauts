# Install NPM dependencies

```
docker run -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node npm install 
```

# Run Websockets

```
docker run --init --rm -p9000:9000 -v "$PWD":/usr/src/app -w /usr/src/app node server.js
```

# Webserver

```
docker run -p8080:80 -v $PWD/:/usr/share/nginx/html:ro nginx
```