# kill all docker
docker kill $(docker ps -q)

# install npm
docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app node npm install

# start our docker
docker run --rm -p9000:9000 -v "$PWD":/usr/src/app -w /usr/src/app node server.js