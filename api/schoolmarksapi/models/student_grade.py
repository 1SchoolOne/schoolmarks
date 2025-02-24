from django.db import models
from django.core.exceptions import ValidationError
from schoolmarksapi.models import User, Grade
import uuid


class StudentGrade(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name="student_grades",
        verbose_name="Évaluation",
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="grades", verbose_name="Étudiant"
    )
    value = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Note")
    comment = models.TextField(null=True, blank=True, verbose_name="Commentaires")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["grade", "student"],
                name="unique_student_grade",
                violation_error_message="Un étudiant ne peut avoir qu'une seule note par évaluation",
            )
        ]

    def clean(self):
        if self.grade and self.value is not None:
            if self.value < 0 or self.value > self.grade.max_value:
                raise ValidationError(
                    "La note doit être comprise entre 0 et la note maximale définie pour cette évaluation"
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
