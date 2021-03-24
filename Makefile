.PHONY: package
package: all
	zip homepage.zip server build -r

.PHONY: all
all: frontend backend

.PHONY: backend
backend:
	go build server.go

.PHONY: frontend
frontend: clean
	npm run build

.PHONY: clean
clean:
	rm -r build
