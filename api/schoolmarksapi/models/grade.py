from django.db import models
from django.core.exceptions import ValidationError
from schoolmarksapi.models import Course
import uuid


class Grade(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="grades", verbose_name="Cours"
    )
    name = models.CharField(max_length=255, verbose_name="Nom de l'évaluation")
    max_value = models.DecimalField(
        max_digits=5, decimal_places=2, verbose_name="Note maximale"
    )
    coef = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Pourcentage de la note finale",
        verbose_name="Coefficient",
    )
    description = models.TextField(null=True, blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        unique_together = [["course", "name"]]

    def clean(self):
        if self.coef is not None:
            if self.coef <= 0:
                raise ValidationError("Le coefficient doit être supérieur à 0")
            if self.coef > 100:
                raise ValidationError("Le coefficient ne peut pas dépasser 100%")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.course.name})"
