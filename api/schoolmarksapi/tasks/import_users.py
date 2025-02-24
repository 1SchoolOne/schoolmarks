import json
import os
import secrets
import string
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from celery import shared_task
import redis

redis_client = redis_client = redis.Redis(
    host=os.environ.get("TASK_REDIS_HOST"),
    port=int(os.environ.get("TASK_REDIS_PORT")),
)


def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_default_username(email: str):
    return email.split("@")[0]


@shared_task
def process_users(import_id, users_to_create, imported_by: str):
    started_at = timezone.now().isoformat()
    total_rows = len(users_to_create)

    def update_import_state(
        progress=0, status="processing", results=None, error=None, finished_at=None
    ):
        state = {
            "type": "users",
            "progress": progress,
            "status": status,
            "results": results,
            "error": error,
            "imported_by": imported_by,
            "started_at": started_at,
            "finished_at": finished_at,
        }
        redis_client.set(f"import_{import_id}", json.dumps(state))

    try:
        update_import_state(progress=0, status="processing")

        with transaction.atomic():
            User = get_user_model()
            created_users = []

            for index, user_data in enumerate(users_to_create, 1):
                temp_password = generate_password()
                username = user_data.get("username") or get_default_username(
                    user_data["email"]
                )
                user_role = user_data.pop("role")

                user = User.objects.create_user(
                    username=username,
                    password=temp_password,
                    has_changed_password=False,
                    **user_data,
                )

                # Assigne les permissions suivant le rôle
                if user_role == "admin":
                    user.is_staff = True
                    user.is_superuser = True
                elif user_role == "teacher":
                    user.is_staff = True
                    user.is_superuser = False

                user.save()

                created_users.append(
                    {
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                        "temp_password": temp_password,
                    }
                )

                progress = int((index / total_rows) * 100)
                update_import_state(progress=progress, status="processing")

        finished_at = timezone.now().isoformat()

        update_import_state(
            progress=100,
            status="completed",
            results=json.dumps(created_users),
            finished_at=finished_at,
        )
    except Exception as e:
        update_import_state(status="failed", error=str(e))
