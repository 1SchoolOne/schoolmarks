import json
import os
from django.db import transaction
from django.utils import timezone
from celery import shared_task
import redis

from schoolmarksapi.models import Class

redis_client = redis.Redis(
    host=os.environ.get("TASK_REDIS_HOST"),
    port=int(os.environ.get("TASK_REDIS_PORT")),
)


@shared_task
def process_classes(import_id, classes_to_create, imported_by: str):
    started_at = timezone.now().isoformat()
    total_rows = len(classes_to_create)

    def update_import_state(
        progress=0, status="processing", results=None, error=None, finished_at=None
    ):
        state = {
            "type": "classes",
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
            created_classes = []

            for index, class_data in enumerate(classes_to_create, 1):
                new_class = Class.objects.create(
                    name=class_data["name"],
                    code=class_data["code"],
                    year_of_graduation=class_data["year_of_graduation"],
                )

                created_classes.append(
                    {
                        "id": str(new_class.id),
                        "name": new_class.name,
                        "code": new_class.code,
                        "year_of_graduation": new_class.year_of_graduation,
                    }
                )

                progress = int((index / total_rows) * 100)
                update_import_state(progress=progress, status="processing")

        finished_at = timezone.now().isoformat()

        update_import_state(
            progress=100,
            status="completed",
            results=json.dumps(created_classes),
            finished_at=finished_at,
        )
    except Exception as e:
        update_import_state(status="failed", error=str(e))
