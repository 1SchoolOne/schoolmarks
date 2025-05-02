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

The project includes multiple [Taskfile](https://taskfile.dev/) to help you set up the development environment quickly.

> [!NOTE]
> Most of these tasks are available through VS Code commande palette.
> Hit `CMD + Shift + P` or `CTRL + Shift + P`, search for `Tasks: Run Task` and it will list all the available tasks.

```sh
task install
```

This command will:

- Install project dependencies
- Set up git hooks

To start the development server, run the `Run development server` VS Code task.

This command will start the API, Celery and the client.

### Available Global Tasks

| Command                    | Description                                 |
| -------------------------- | ------------------------------------------- |
| `task install`             | Install all dependencies for API and client |
| `task lint`                | Run linting for both API and client         |
| `task format`              | Format code in both API and client projects |
| `task generate-api-client` | Generate API client code based on schema    |

### Available API Tasks

| Command                    | Description                       |
| -------------------------- | --------------------------------- |
| `task api:install`         | Install dependencies              |
| `task api:run`             | Run the Django development server |
| `task api:run-celery`      | Run the Celery worker             |
| `task api:generate-schema` | Generate OpenAPI schema client    |
| `task api:lint`            | Lint the code                     |
| `task api:format`          | Format the code                   |
| `task api:make-migrations` | Generate migration files          |
| `task api:migrate`         | Apply migrations to the database  |

### Available Client Tasks

| Command                           | Description                |
| --------------------------------- | -------------------------- |
| `task client:install`             | Install dependencies       |
| `task client:run`                 | Run the development server |
| `task client:build`               | Build the project          |
| `task client:lint`                | Lint the code              |
| `task client:format`              | Format the code            |
| `task client:test`                | Run tests                  |
| `task client:generate-api-client` | Generate API client code   |

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

> [!IMPORTANT] > `.env.production` contains standardized production values and should not be modified.

## Troubleshooting

If you're having trouble pushing commits from within the dev container, please refer to the [VS Code documentation](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_using-ssh-keys) on sharing Git credentials.
