.PHONY: docs server

docs:
	plantuml docs/sequence/*/*.txt

lint:
	golint ./...

server:
	go build -o catan_server ./...
