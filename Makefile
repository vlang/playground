build_ts:
	npm install ./www/ts
	tsc -p ./www/ts/tsconfig.json

build_ts_watch:
	npm install ./www/ts
	tsc -w -p ./www/ts/tsconfig.json

build: build_ts
	v server.v

run: build
	./server

run_docker: build
	docker-compose up -d
