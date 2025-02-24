from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from schoolmarksapi.models import Grade, StudentGrade
from schoolmarksapi.serializers import GradeSerializer, StudentGradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["course"]
    search_fields = ["name"]
    ordering_fields = ["created_at", "name"]


class StudentGradeViewSet(viewsets.ModelViewSet):
    queryset = StudentGrade.objects.all()
    serializer_class = StudentGradeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["grade", "student"]
    search_fields = ["grade__name", "student__email"]
    ordering_fields = ["created_at", "value"]
