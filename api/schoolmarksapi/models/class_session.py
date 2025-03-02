from django.db import models
from schoolmarksapi.models.course_class_enrollment import CourseClassEnrollment
from schoolmarksapi.models.school_class import Class
from schoolmarksapi.models.course import Course
import uuid


class ClassSession(models.Model):
    """Individual class sessions for a specific class and course"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="sessions"
    )
    class_group = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="sessions"
    )
    course_class_enrollment = models.ForeignKey(
        CourseClassEnrollment,
        on_delete=models.CASCADE,
        related_name="sessions",
        null=True,  # Allow null for data migration purposes
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50)

    class Meta:
        # Sessions should be uniquely identified by the course, class, and date/time combination
        unique_together = [["course", "class_group", "date", "start_time"]]

    def save(self, *args, **kwargs):
        # Automatically link to the corresponding CourseClassEnrollment if not provided
        if not self.course_class_enrollment:
            try:
                self.course_class_enrollment = CourseClassEnrollment.objects.get(
                    course=self.course, class_group=self.class_group
                )
            except CourseClassEnrollment.DoesNotExist:
                # If no enrollment exists, you might want to create one or raise an error
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.code} - {self.class_group.code} session on {self.date}"
