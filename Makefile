client:
	cd client && deno task dev
server:
	cd server && go run main.go
dev:
	make server & make client
.PHONY: client server dev