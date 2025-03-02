HOOKS_SOURCE = scripts/hooks
HOOKS_DIR = .git/hooks
DJANGO_MANAGE=api/manage.py

# Colors for output (using echo)
BLUE := $(shell printf "\033[34m")
GREEN := $(shell printf "\033[32m")
YELLOW := $(shell printf "\033[33m")
RED := $(shell printf "\033[31m")
RESET := $(shell printf "\033[0m")

.PHONY: setup install-api install-client install-hooks clean-hooks generate-api-types dev commit clean-api

# Setup the project
setup: install-api install-client install-hooks

# Install the API dependencies
install-api:
	cd api && uv sync

# Install the client dependencies
install-client:
	cd client && yarn

# Install git hooks
install-hooks:
	@echo "$(BLUE)Installing git hooks...$(RESET)"
	@uvx pre-commit@4.1.0 install
	@echo "$(GREEN)Successfully installed git hooks.$(RESET)"

# Clean git hooks
clean-hooks:
	@echo "$(BLUE)Cleaning git hooks...$(RESET)"
	@if ./scripts/clean-hooks.sh; then \
		echo "$(GREEN)Successfully cleaned git hooks.$(RESET)"; \
	else \
		echo "$(RED).git/hooks directory not found, skipping clean.$(RESET)"; \
	fi

# Generate API types
generate-api-types:
	./scripts/generate-api-types.sh

# Lint the code
lint: lint-api lint-client

# Lint the API code
lint-api:
	uvx ruff check api

# Lint the client code
lint-client:
	cd client && yarn lint

# Run the development server
dev:
	overmind start -f Procfile

commit:
	uvx --from commitizen cz commit

clean-api:
	./scripts/clean-api-caches.sh


# Show help message
help:
	@echo "$(BLUE)Available commands:$(RESET)"
	@echo "  $(GREEN)setup$(RESET)                Setup the project"
	@echo "  $(GREEN)install-api$(RESET)          Install the API dependencies"
	@echo "  $(GREEN)install-client$(RESET)       Install the client dependencies"
	@echo "  $(GREEN)install-hooks$(RESET)        Install git hooks"
	@echo "  $(GREEN)clean-hooks$(RESET)          Clean git hooks"
	@echo "  $(GREEN)generate-api-types$(RESET)   Generate API types"
	@echo "  $(GREEN)lint$(RESET)                 Lint the code"
	@echo "  $(GREEN)lint-api$(RESET)             Lint the API code"
	@echo "  $(GREEN)lint-client$(RESET)          Lint the client code"
	@echo "  $(GREEN)dev$(RESET)                  Run the development server"
	@echo "  $(GREEN)help$(RESET)                 Show this help message"