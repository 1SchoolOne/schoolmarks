from celery import shared_task
from django.utils import timezone
from schoolmarksapi.models.checkin_session import CheckinSession
from schoolmarksapi.models.course_enrollment import CourseEnrollment
from schoolmarksapi.models.attendance_record import AttendanceRecord
from schoolmarksapi.models.class_student import ClassStudent
import logging


logger = logging.getLogger(__name__)


class AttendanceStatus:
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"


@shared_task
def close_checkin_session(checkin_session_id: str):
    logger.info(f"Fermeture de l'appel {checkin_session_id}")

    try:
        checkin_session = CheckinSession.objects.select_related(
            "class_session__course"
        ).get(id=checkin_session_id)

        if checkin_session.status == "closed":
            logger.warning(f"L'appel {checkin_session_id} est déjà fermé")
            return

        # Récupère le cours correspondant à cet appel
        course = checkin_session.class_session.course

        # Récupère les étudiants inscrit à ce cours
        enrolled_class_groups = CourseEnrollment.objects.filter(
            course=course
        ).values_list("class_group_id", flat=True)

        enrolled_students = ClassStudent.objects.filter(
            class_group_id__in=enrolled_class_groups
        ).select_related("student")

        # Liste les étudiants déjà enregistré à cet appel
        existing_records = AttendanceRecord.objects.filter(
            checkin_session=checkin_session
        ).values_list("student_id", flat=True)

        now = timezone.now()

        absent_records = []

        for class_student in enrolled_students:
            if class_student.student_id not in existing_records:
                absent_records.append(
                    AttendanceRecord(
                        checkin_session=checkin_session,
                        student=class_student.student,
                        checked_in_at=now,
                        status=AttendanceStatus.ABSENT,
                    )
                )

        if absent_records:
            created_count = len(AttendanceRecord.objects.bulk_create(absent_records))
            logger.info(
                f"{created_count} élèves ont été noté absent pour l'appel {checkin_session_id}"
            )

        checkin_session.status = "closed"
        checkin_session.save()

        logger.info(f"L'appel {checkin_session_id} a été fermé avec succès")

    except CheckinSession.DoesNotExist:
        logger.error(f"L'appel {checkin_session_id} n'a pas été trouvé")
    except Exception as e:
        logger.error(
            f"Erreur lors de la fermeture de l'appel {checkin_session_id}: {str(e)}",
            exc_info=True,
        )
        raise
