from django.db import models
from schoolmarksapi.models import User, ClassSession, Course, AttendanceRecord
import uuid


class AttendanceDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance_record = models.ForeignKey(
        AttendanceRecord, on_delete=models.CASCADE, related_name="details"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="attendance_details"
    )
    class_session = models.ForeignKey(
        ClassSession, on_delete=models.CASCADE, related_name="attendance_details"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="attendance_details"
    )
    status = models.CharField(max_length=20)
    checked_in_at = models.DateTimeField()
    minutes_late = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
