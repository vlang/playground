build_ts:
	cd ./www && npm ci && npm run build

build_ts_watch:
	cd ./www && npm ci && npm run watch

mkdir:
	mkdir -p ./server/bin

build: build_ts mkdir
	v server -o ./server/bin/server

local_build: mkdir
	v -g -d local -d uselibbacktrace -o ./server/bin/server ./server

run: build
	./server/bin/server

local_run: local_build
	./server/bin/server

run_docker:
	docker-compose up -d
