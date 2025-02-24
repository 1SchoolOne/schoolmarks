from django.db import models
from django.core.exceptions import ValidationError
import uuid


class Class(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    year_of_graduation = models.IntegerField(
        null=True, blank=True, verbose_name="Année de diplôme"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        ordering = ["-year_of_graduation", "name"]

    def clean(self):
        if self.year_of_graduation and self.year_of_graduation < 2000:
            raise ValidationError("L'année de diplôme doit être supérieure à 2000")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"
