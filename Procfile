celery: cd api && DJANGO_SETTINGS_MODULE=schoolmarksapi.settings.dev uv run celery -A common worker -l info
api: cd api && uv run manage.py runserver --settings=schoolmarksapi.settings.dev
client: cd client && yarn dev