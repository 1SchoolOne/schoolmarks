from django.db import models
from django.core.exceptions import ValidationError
from schoolmarksapi.models import User
import uuid


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    professor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="professor_courses",
        verbose_name="Professeur",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        ordering = ["name"]

    def clean(self):
        if self.professor and self.professor.is_staff is False:
            raise ValidationError(
                "L'utilisateur assigné doit avoir le rôle de professeur"
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"
