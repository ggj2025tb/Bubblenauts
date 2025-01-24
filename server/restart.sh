# kill all docker
docker kill $(docker ps -q)

# start our docker
docker run -d --rm -p9000:9000 -v "$PWD":/usr/src/app -w /usr/src/app node server.ts
