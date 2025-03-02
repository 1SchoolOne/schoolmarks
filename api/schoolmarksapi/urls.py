from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from schoolmarksapi.views.import_view import (
    ClassBulkImportView,
    CourseBulkImportView,
    ImportDetailView,
    UserBulkImportView,
)

from .views import (
    ClassViewSet,
    CourseViewSet,
    ClassStudentViewSet,
    ClassSessionViewSet,
    CheckinSessionViewSet,
    AttendanceViewSet,
    AssessmentViewSet,
    StudentGradeViewSet,
    UserViewSet,
)

# API Documentation configuration
schema_view = get_schema_view(
    openapi.Info(
        title="SchoolMark API",
        default_version="v2",
        description="API documentation for SchoolMark application",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@schoolmark.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=False,
    permission_classes=[permissions.AllowAny],
)

# API Router configuration
router = DefaultRouter()
# User management
router.register(r"users", UserViewSet)
# Class management
router.register(r"classes", ClassViewSet)
router.register(r"class_students", ClassStudentViewSet)
router.register(r"class_sessions", ClassSessionViewSet)
# Course management
router.register(r"courses", CourseViewSet)
# Attendance management
router.register(r"checkin_sessions", CheckinSessionViewSet)
router.register(r"attendances", AttendanceViewSet)
# Grades management
router.register(r"assessments", AssessmentViewSet)
router.register(r"student_grades", StudentGradeViewSet)

urlpatterns = [
    # Admin interface
    path("admin/", admin.site.urls),
    # Authentication
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    # API Documentation
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"
    ),
    # Import CSV
    path("import/users/", UserBulkImportView.as_view(), name="user-import"),
    path("import/classes/", ClassBulkImportView.as_view(), name="class-import"),
    path("import/courses/", CourseBulkImportView.as_view(), name="course-import"),
    path("import/<str:import_id>/", ImportDetailView.as_view(), name="import-detail"),
    # API Routes
    path("", include(router.urls)),
]
