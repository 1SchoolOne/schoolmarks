from django.db import models
from schoolmarksapi.models import User, ClassSession
import uuid


class CheckinSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_session = models.ForeignKey(
        ClassSession, on_delete=models.CASCADE, related_name="checkins"
    )
    started_at = models.DateTimeField()
    closed_at = models.DateTimeField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="checkins_created"
    )
    status = models.CharField(max_length=50)
    secret = models.CharField(max_length=32, null=True, blank=True, db_index=True)
