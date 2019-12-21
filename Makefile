.PHONY: docs server

docs:
	plantuml docs/sequence/*/*.txt

server:
	go build -o catan_server ./...
