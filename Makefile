
APP_NAME=transcendence

.PHONY: up down clean logs build restart

up:
	docker-compose up --build -d

down:
	docker-compose down

clean:
	docker-compose down -v --rmi all --remove-orphans

logs:
	docker-compose logs -f

build:
	docker-compose build

restart:
	docker-compose down && docker-compose up --build -d

superclean: clean
	docker system prune --volumes
