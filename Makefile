build_ts:
	cd ./www/ts && npm install
	tsc -p ./www/ts/tsconfig.json

build_ts_watch:
	cd ./www/ts && npm install
	tsc -w -p ./www/ts/tsconfig.json

build: build_ts
	v server.v

run: build
	./server

run_docker:
	docker-compose up -d
