from django.db import models
from schoolmarksapi.models.course import Course
from schoolmarksapi.models.school_class import Class
import uuid


class CourseClassEnrollment(models.Model):
    """Lie un cours à une classe"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="classes")
    class_group = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="courses"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["course", "class_group"]]

    def __str__(self):
        return f"{self.course.name} ({self.course.code}) - {self.class_group.name} ({self.class_group.code})"
