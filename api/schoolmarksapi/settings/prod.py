from .settings import *
import os
from dotenv import load_dotenv

from urllib.parse import urlparse


def extract_redis_connection(url):
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port
    return host, port


load_dotenv()

DEBUG = True

ALLOWED_HOSTS = [
    "178.170.121.137",
    "api.schoolmarks.app",
    "schoolmarks.app",
]
CSRF_TRUSTED_ORIGINS = [
    "http://178.170.121.137",
    "https://api.schoolmarks.app",
    "https://schoolmarks.app",
]
CORS_ALLOWED_ORIGINS = [
    "http://178.170.121.137",
    "https://api.schoolmarks.app",
    "https://schoolmarks.app",
]

CORS_ALLOW_CREDENTIALS = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SAMESITE = "None"

SESSION_COOKIE_DOMAIN = "schoolmarks.app"
CSRF_COOKIE_DOMAIN = "schoolmarks.app"


host, port = extract_redis_connection(os.getenv("CELERY_BROKER_URL"))

os.environ.setdefault("TASK_REDIS_HOST", str(host))
os.environ.setdefault("TASK_REDIS_PORT", str(port))

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
