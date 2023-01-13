build_ts:
	cd ./www && npm ci && npm run build

build_ts_watch:
	cd ./www && npm ci && npm run watch

build: build_ts
	v server.v

local_build:
	v -g -d local server.v

run: build
	./server

local_run: local_build
	./server

run_docker:
	docker-compose up -d
