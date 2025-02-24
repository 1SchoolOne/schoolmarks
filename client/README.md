# SchoolMarks

A React application built with Vite for managing school marks and academic performance.

## Prerequisites

### System Requirements

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
- Log into your GitHub account and select the _**schoolmarks-client**_ repository

### 2. Setup Project

The project includes a Makefile to help you set up the development environment quickly:

```bash
make setup
```

This command will:

- Check system dependencies
- Install project dependencies
- Set up git hooks

### Available Make Commands

| Command              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `make setup`         | Complete project setup (install dependencies and hooks) |
| `make install-hooks` | Install git hooks only                                  |
| `make install-deps`  | Install node dependencies only                          |
| `make clean`         | Remove all installed dependencies and hooks             |
| `make lint`          | Check for code linting errors                           |
| `make fix-lint`      | Fix code linting errors                                 |
| `make format`        | Check for code formatting errors                        |
| `make fix-format`    | Fix code formatting errors                              |
| `make help`          | Show available make commands                            |

### Development

#### Running the Application

```bash
yarn dev
```

#### Building for Production

```bash
yarn build
```

### Environment Variables

- `.env.yarn`: Required. Contains variables for dependencies installation and registries.
- `.env.development`: Required. Contains default non-sensitive development values.
- `.env.production`: Contains default non-sensitive production values.

> [!IMPORTANT]
> `.env.production` contains standardized production values and should not be modified.

### Commit Guidelines

This project uses Commitizen for standardized commit messages. After setup, simply use `git commit` and follow the prompts.

## Project Structure

- `public/`: Static assets
- `.githooks/`: Custom git hooks
- `src/`: Main source code
  - `components`: UI components that does not contain any business logic
  - `routes`: App routes, this is where the business logic is handled
  - `types`: Model interfaces and common types that can be shared across the app

## Troubleshooting

### Node.js Version

Ensure you're using Node.js v20.17.0 or higher. If you encounter version-related issues:

- Use a version manager like `nvm`
- Update Node.js to the recommended version

### Dependency Issues

If you face problems with dependencies:

```bash
make clean-deps
make install-deps
```

## Troubleshooting

If you're having trouble pushing commits from within the dev container, please refer to the [VS Code documentation](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_using-ssh-keys) on sharing Git credentials.
