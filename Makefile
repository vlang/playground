build_ts:
	cd ./www && npm ci && npm run build

build_ts_watch:
	cd ./www && npm ci && npm run watch

build: build_ts
	v server.v

run: build
	./server

run_docker:
	docker-compose up -d
