# SchoolMarks

A React application built with Vite for managing school marks and academic performance.

## Prerequisites

### System Requirements

- UV package manager
- Node.js (v20.17.0 or higher)
- Yarn package manager

### IDE Recommendations

> [!NOTE]
> For the best development experience, it is highly recommended to use VS Code and the dev container for a pre-configured environment.
>
> If you use want to use another IDE, install ESLint and Prettier extensions and configure ESLint to run on save.

## Getting Started

### 1. Create the dev container

- Install VS Code "_**Dev Containers**_" extension
- Open the command palette `CMD + Shift + P` or `CTRL + Shift + P`
- Select "_**Dev Containers: Clone Repository in Container Volume**_"
- Log into your GitHub account and select the _**schoolmarks**_ repository

### 2. Setup Project

The project includes a Makefile to help you set up the development environment quickly:

```sh
make setup
```

This command will:

- Install project dependencies
- Set up git hooks

Then, to start the development server:

```sh
make dev
```

This command will start the API, Celery and the client.

### Available Make Commands

| Command              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `make setup`         | Complete project setup (install dependencies and hooks) |
| `make install-api`   | Install the API dependencies                            |
| `make install-client`| Install the client dependencies                         |
| `make install-hooks` | Install git hooks only                                  |
| `make clean-hooks`   | Clean git hooks                                         |
| `make lint`          | Lint the code                                           |
| `make lint-api`      | Lint the API code                                       |
| `make lint-client`   | Lint the client code                                    |
| `make dev`           | Run the development server                              |
| `make help`          | Show available make commands                            |

## Development

### API

### Environment Variables

The `.env` file should contains the following variables:

```
SECRET_KEY=<django-secret-key>
DATABASE_NAME=<database-name>
DATABASE_USER=<database-user>
DATABASE_PASSWORD=<database-password>
DATABASE_HOST=<database-host>
DATABASE_PORT=<database-port>

CELERY_BROKER_URL=<celery-broker-url>
DJANGO_SETTINGS_MODULE=<django-settings-module>
```

### Debugging

Enable Django Debug Mode in the `manage.py` file:

```manage.py
'schoolmarksapi.settings.debug'
or prod : 
'schoolmarksapi.settings.prod'

```

> [!WARNING] Do not enable DEBUG mode in production.


### Client

### Environment Variables

- `.env.yarn`: Required. Contains variables for dependencies installation and registries.
- `.env.development`: Required. Contains default non-sensitive development values.
- `.env.production`: Contains default non-sensitive production values.

> [!IMPORTANT]
> `.env.production` contains standardized production values and should not be modified.

## Troubleshooting

If you're having trouble pushing commits from within the dev container, please refer to the [VS Code documentation](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_using-ssh-keys) on sharing Git credentials.