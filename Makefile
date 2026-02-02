# couleurs :P
RED = \033[0;31m
REDBD = \033[1;31m
GREEN = \033[0;32m
GREENBD = \033[1;32m
YELLOW = \033[0;33m
YELLOWBD = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
RESET = \033[0m

# regles : make help
DATA_DB_DIR = ./packages/backend/data_db
CERTS_DIR = ./packages/config/certs
USERS_UPLOADS_DIR = ./packages/backend/uploads/users
LOGS_DIR = ./packages/logs

LAUNCH_TRANSCENDANCE_DEV = docker-compose -f docker-compose.dev.yml
LAUNCH_TRANSCENDANCE_PROD = docker-compose -f docker-compose.yml

all: dev_or_prod

dev_or_prod:
	@echo "$(YELLOWBD)You need to lauch either make dev or make prod.$(RESET)"
	@echo "$(YELLOW)This message was displayed by make all.$(RESET)"

################ PROD ################
prod: clean_logs create
	@echo "$(GREENBD)1/1 " "$(YELLOWBD)Lauching docker-compose PROD$(RESET)"; \
	$(LAUNCH_TRANSCENDANCE_PROD) up --build

################ END PROD ################

################ DEV ################
dev: clean_logs create
	@echo "$(GREENBD)1/1 " "$(YELLOWBD)Lauching docker-compose DEV$(RESET)"; \
	$(LAUNCH_TRANSCENDANCE_DEV) up --build
################ END DEV ################

################ CREATE ################
create_db:
	@if [ -d $(DATA_DB_DIR) ]; then \
		echo "$(GREENBD)1/2 " "$(YELLOW)data_db and uploads/users already exist$(RESET)"; \
		echo "$(GREENBD)2/2 " "$(YELLOWBD)You can run make clean_db to delete them$(RESET)"; \
	else \
		echo "$(GREENBD)1/2 " "$(YELLOW)data_db and uploads/users exist, creation...$(RESET)"; \
		mkdir -p $(DATA_DB_DIR); \
		mkdir -p $(USERS_UPLOADS_DIR); \
		echo "$(GREENBD)2/2 " "$(YELLOW)data_db and uploads/users now exist !$(RESET)"; \
	fi; \

create_certs:
	@if [ -d $(CERTS_DIR) ]; then \
		echo "$(GREENBD)1/2 " "$(YELLOW)certs already exists$(RESET)"; \
		echo "$(GREENBD)2/2 " "$(YELLOWBD)You can run make clean_certs to delete it$(RESET)"; \
	else \
		echo "$(GREENBD)1/2 " "$(YELLOW)certs doesn't exist, creation...$(RESET)"; \
		mkdir -p $(CERTS_DIR); \
		echo "$(GREENBD)2/2 " "$(CYAN)certs/ : TLS certificate generation$(RESET)"; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(CERTS_DIR)/selfsigned.key \
			-out $(CERTS_DIR)/selfsigned.crt \
			-subj "/C=FR/ST=Ile-de-France/L=Paris/O=LesSuperNanas/CN=transcendance.42.fr"; \
	fi; \

create_logs:
	@if [ -d $(LOGS_DIR) ]; then \
		echo "$(GREENBD)1/2 " "$(YELLOW)logs already exist$(RESET)"; \
		echo "$(GREENBD)2/2 " "$(YELLOWBD)You can run make clean_logs to delete it$(RESET)"; \
	else \
		echo "$(GREENBD)1/2 " "$(YELLOW)logs doesn't exist, creation...$(RESET)"; \
		mkdir -p $(LOGS_DIR); \
		echo "$(GREENBD)2/2 " "$(YELLOW)logs now exists !$(RESET)"; \
	fi; \

create: create_db create_certs create_logs
################ END CREATE ################

################ CLEAN ################
clean_db:
	@echo "$(GREENBD)1/2 " "$(REDBD)! Suppression du dossier data_db !$(RESET)"; \
	rm -rf $(DATA_DB_DIR)

	@echo "$(GREENBD)2/2 " "$(REDBD)! Suppression du dossier uploads/users !$(RESET)"; \
	rm -rf $(USERS_UPLOADS_DIR)

clean_logs:
	@echo "$(GREENBD)1/1 " "$(REDBD)! Suppression du dossier logs !$(RESET)"; \
	rm -rf $(LOGS_DIR) 

clean_certs:
	@echo "$(GREENBD)1/1 " "$(REDBD)! Suppression du dossier certs !$(RESET)"; \
	rm -rf ./packages/config; \


clean: clean_db clean_certs clean_logs
################ END CLEAN ################

################ FCLEAN ################
fclean_dev: stop down clean 
	docker rmi transcendance_frontend:dev transcendance_backend:dev

fclean_prod: stop down clean 
	docker rmi transcendance_frontend:prod transcendance_backend:prod

################ END FCLEAN ################

################ RE ################
re_dev: fclean_dev dev

re_prod: fclean_prod prod
################ END RE ################

################ COMMANDES COMPOSE ################
stop:
	@echo "$(GREENBD)1/1 " "$(YELLOW)Compose stop : Stopping containers$(RESET)"; \
	$(LAUNCH_TRANSCENDANCE_DEV) stop

down:
	@echo "$(GREENBD)1/1 " "$(YELLOW)Compose down : Stopping and suppressing containers and networks$(RESET)"; \
	$(LAUNCH_TRANSCENDANCE_DEV) down

status:
	@echo "$(GREENBD)1/5 " "$(GREENBD)- List of containers, images, networks and volumes$(RESET)"
	@echo "$(GREENBD)2/5 " "$(YELLOWBD)Containers list :$(RESET)"
	@docker ps -a

	@echo "$(GREENBD)3/5 " "$(YELLOWBD)Images list :$(RESET)"
	@docker images

	@echo "$(GREENBD)4/5 " "$(YELLOWBD)Networks list :$(RESET)"
	@docker network ls

	@echo "$(GREENBD)5/5 " "$(YELLOWBD)Volumes list :$(RESET)"
	@docker volume ls
################ END COMMANDES COMPOSE ################

help:
	@echo "$(GREENBD)1/20 " "$(YELLOWBD) - Commands list of makefile -$(RESET)"
	@echo "$(GREENBD)2/20 " "$(YELLOW) - all : dev_or_prod : display a message to choose make prod or make dev $(RESET)"
	@echo "$(GREENBD)3/20 " "$(YELLOW) - prod : create and run docker compose up --build for PROD$(RESET)"
	@echo "$(GREENBD)4/20 " "$(YELLOW) - dev : create and run docker compose up --build for DEV$(RESET)"
	@echo "$(GREENBD)5/20 " "$(YELLOW) - create : create_db + create_certs + create_logs if needed$(RESET)"
	@echo "$(GREENBD)6/20 " "$(YELLOW) - create_db : create data_db and uploads/users$(RESET)"
	@echo "$(GREENBD)7/20 " "$(YELLOW) - create_certs : create config/certs$(RESET)"
	@echo "$(GREENBD)8/20 " "$(YELLOW) - create_logs : create logs$(RESET)"
	@echo "$(GREENBD)9/20 " "$(YELLOW) - clean : clean_db + clean_logs + clean_certs$(RESET)"
	@echo "$(GREENBD)10/20 " "$(YELLOW) - clean_db : clean data_db and uploads/users$(RESET)"
	@echo "$(GREENBD)11/20 " "$(YELLOW) - clean_logs : clean logs$(RESET)"
	@echo "$(GREENBD)12/20 " "$(YELLOW) - clean_certs : clean config/certs$(RESET)"
	@echo "$(GREENBD)13/20 " "$(YELLOW) - fclean_dev : stop down clean and rmi :dev images$(RESET)"
	@echo "$(GREENBD)14/20 " "$(YELLOW) - fclean_prod : stop down clean and rmi :prod images$(RESET)"
	@echo "$(GREENBD)15/20 " "$(YELLOW) - re_dev : fclean_dev and run dev$(RESET)"
	@echo "$(GREENBD)16/20 " "$(YELLOW) - re_prod : fclean_prod and run prod$(RESET)"
	@echo "$(GREENBD)17/20 " "$(YELLOW) - stop : run docker compose stop - stop running containers$(RESET)"
	@echo "$(GREENBD)18/20 " "$(YELLOW) - down : run docker compose down - stop then delete containers and networks$(RESET)"
	@echo "$(GREENBD)19/20 " "$(YELLOW) - status : display running containers, images, networks and volumes$(RESET)"
	@echo "$(GREENBD)20/20 " "$(YELLOW) - help : display this help$(RESET)"

.PHONY: all dev_or_prod prod dev create create_db create_certs create_logs clean clean_db clean_logs clean_certs fclean_dev fclean_prod re_dev re_prod stop down status help
