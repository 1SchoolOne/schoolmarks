# SchoolMarks API

A Django REST Framework API for managing school marks, attendance, and academic performance.

## Prerequisites

### System Requirements

- Python 3.13 or higher
- [uv (Python package and project manager)](https://docs.astral.sh/uv/getting-started/installation/)
- PostgreSQL (if not using SQLite for development)

## Getting Started

### 1. Setup Project

The project includes a Makefile to help you set up the development environment quickly:

```bash
make setup
```

This command will:

- Check system dependencies
- Install project dependencies

### Available Make Commands

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `make help`            | Show available make commands                                       |
| `make setup`           | Update uv, create the virtual environment and install dependencies |
| `make run`             | Start the Django API server                                        |
| `make dev`             | Start the Django API server with development settings              |
| `make migrations`      | Create migration files for the app                                 |
| `make migrate`         | Apply database migrations                                          |
| `make generate-schema` | Generate the OpenAPI schema                                        |
| `make lint`            | Lint codebase with Ruff                                            |
| `make format`          | Format codebase with Ruff                                          |
| `make test`            | Run test suite                                                     |
| `make clean`           | Clean up temporary and residual files                              |
| `make run-celery`      | Run the Celery worker                                              |

### Running the Application

Start the API server:

```bash
make run
```

The API will be accessible at `http://127.0.0.1:8000/` by default.

### API Endpoints

The following endpoints are available:

- `/users/`: Manage users
- `/user_roles/`: Manage user roles
- `/classes/`: Manage classes
- `/courses/`: Manage courses
- `/course_enrollments/`: Manage course enrollments
- `/class_students/`: Manage students in classes
- `/class_sessions/`: Manage class sessions
- `/checkin_sessions/`: Manage check-in sessions
- `/attendance_records/`: Manage attendance records
- `/attendance_details/`: Manage attendance details
- `/grades/`: Manage grades

### Additional Features

- CSRF Token Endpoint: `/get-csrf-token/`
- Admin Panel: `/admin/`
- Django Allauth Endpoints: `/accounts/` and `/_allauth/`
- API Documentation:
  - Swagger UI: `/swagger/`
  - Redoc: `/redoc/`

### Environment Variables

- `.env`: Required. Contains environment-specific variables like database configurations, secret keys, etc.
- `settings.py`: References the environment variables for configurations.

> [!IMPORTANT]
> Always keep sensitive data, such as the secret key, database credentials, and API keys, in environment variables.

## Testing

Run the test suite:

```bash
make test
```

## Troubleshooting

### Database Issues

Ensure your database is running and correctly configured in the `.env` file. For PostgreSQL:

- Verify database URL and credentials
- Run migrations again:

```bash
make migrate
```

### Dependency Issues

If you face problems with dependencies:

```bash
make clean
make setup
```

### Debugging

Enable Django Debug Mode in the `manage.py` file:

```manage.py
'schoolmarksapi.settings.debug'
or prod : 
'schoolmarksapi.settings.prod'

```

> [!WARNING] Do not enable DEBUG mode in production.
