from .settings import *
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = True

ALLOWED_HOSTS = [
    "178.170.121.137",
    "api.schoolmarks.app",
    "schoolmarks.app",
    "localhost",
    "127.0.0.1",
    "172.17.0.2",
]
CSRF_TRUSTED_ORIGINS = [
    "http://178.170.121.137",
    "https://api.schoolmarks.app",
    "https://schoolmarks.app",
    "http://127.0.0.1:8080",
    "http://172.17.0.2:8080",
]
CORS_ALLOWED_ORIGINS = [
    "http://178.170.121.137",
    "https://api.schoolmarks.app",
    "https://schoolmarks.app",
    "http://localhost",
    "http://127.0.0.1",
    "http://172.17.0.2",
]

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CORS_ALLOW_CREDENTIALS = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.getenv("DATABASE_NAME"),
        "USER": os.getenv("DATABASE_USER"),
        "PASSWORD": os.getenv("DATABASE_PASSWORD"),
        "HOST": os.getenv("DATABASE_HOST"),
        "PORT": os.getenv("DATABASE_PORT", "5432"),
    }
}
