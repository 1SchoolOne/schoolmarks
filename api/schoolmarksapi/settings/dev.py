from .settings import *
import os
from django.db.models.signals import post_migrate
from django.core.management import call_command


def load_initial_data(sender, **kwargs):
    if sender.name == "schoolmarksapi":
        call_command("loaddata", "initial_data")


post_migrate.connect(load_initial_data)

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "172.17.0.2"]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8080",
    "http://172.17.0.2:8080",
]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://172.17.0.2:8080",
]

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = True
CORS_ALLOW_CREDENTIALS = True


os.environ.setdefault("TASK_REDIS_HOST", "localhost")
os.environ.setdefault("TASK_REDIS_PORT", "6379")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
