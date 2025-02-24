import json
import os
from django.db import transaction
from django.utils import timezone
from celery import shared_task
import redis
from django.contrib.auth import get_user_model

from schoolmarksapi.models import Course

User = get_user_model()
redis_client = redis_client = redis.Redis(
    host=os.environ.get("TASK_REDIS_HOST"),
    port=int(os.environ.get("TASK_REDIS_PORT")),
)


@shared_task
def process_courses(import_id, courses_to_create, imported_by: str):
    started_at = timezone.now().isoformat()
    total_rows = len(courses_to_create)

    def update_import_state(
        progress=0,
        status="processing",
        results=None,
        error=None,
        finished_at=None,
        warnings=None,
    ):
        state = {
            "type": "courses",
            "progress": progress,
            "status": status,
            "results": results,
            "error": error,
            "warnings": warnings,
            "imported_by": imported_by,
            "started_at": started_at,
            "finished_at": finished_at,
        }
        redis_client.set(f"import_{import_id}", json.dumps(state))

    try:
        update_import_state(progress=0, status="processing")
        warnings = []

        with transaction.atomic():
            created_courses = []

            for index, course_data in enumerate(courses_to_create, 1):
                # Try to find professor if email is provided
                professor = None
                if professor_email := course_data.get("teacher_email"):
                    try:
                        professor = User.objects.get(email=professor_email)
                    except User.DoesNotExist:
                        warnings.append(
                            f"Professor with email {professor_email} not found for course {course_data['code']}"
                        )

                new_course = Course.objects.create(
                    name=course_data["name"],
                    code=course_data["code"],
                    professor=professor,
                )

                created_courses.append(
                    {
                        "id": str(new_course.id),
                        "name": new_course.name,
                        "code": new_course.code,
                        "professor": (
                            f"{professor.first_name} {professor.last_name}"
                            if professor
                            else None
                        ),
                        "professor_email": (professor_email if professor else None),
                    }
                )

                progress = int((index / total_rows) * 100)
                update_import_state(
                    progress=progress,
                    status="processing",
                    warnings=warnings if warnings else None,
                )

        finished_at = timezone.now().isoformat()

        update_import_state(
            progress=100,
            status="completed",
            results=json.dumps(created_courses),
            warnings=warnings if warnings else None,
            finished_at=finished_at,
        )

    except Exception as e:
        update_import_state(status="failed", error=str(e))
