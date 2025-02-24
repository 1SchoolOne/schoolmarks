import math
from rest_framework import status, views
from rest_framework.response import Response
import csv
from io import TextIOWrapper
import uuid
from common.utils import ImportStatusService
from common.permissions import IsAdmin
from schoolmarksapi.serializers.import_serializer import (
    CourseCSVRowSerializer,
    CreateImportResponse,
    ImportStatusSerializer,
)
from schoolmarksapi.serializers.import_serializer import (
    UserCSVRowSerializer,
    ClassCSVRowSerializer,
    ImportSerializer,
)
from schoolmarksapi.tasks.import_courses import process_courses
from schoolmarksapi.tasks.import_users import process_users
from schoolmarksapi.tasks.import_classes import process_classes
from drf_spectacular.utils import extend_schema_view, extend_schema


@extend_schema_view(
    get=extend_schema(
        responses=ImportStatusSerializer,
        description="Retrieves user import information",
    ),
    post=extend_schema(
        request=ImportSerializer,
        description="Creates a new user import",
        responses=CreateImportResponse,
    ),
)
class UserBulkImportView(views.APIView):
    http_method_names = ["get", "post"]
    permission_classes = [IsAdmin]

    def get(self, request):
        service = ImportStatusService()

        per_page = request.query_params.get("per_page")
        page = request.query_params.get("page")

        if per_page:
            per_page = int(per_page)
            page = int(page) if page else 1
        else:
            per_page = None
            page = None

        imports, total = service.get_imports(type="users", page=page, per_page=per_page)

        serializer = ImportStatusSerializer(imports, many=True)

        response = {"results": serializer.data, "total": total}

        if per_page:
            response.update(
                {
                    "page": page,
                    "per_page": per_page,
                    "total_page": math.ceil(total / per_page),
                }
            )

        return Response(response)

    def post(self, request):
        serializer = ImportSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        csv_file = TextIOWrapper(
            serializer.validated_data["file"].file, encoding="utf-8"
        )

        csv_reader = csv.DictReader(csv_file)
        users_to_create = []
        errors = []

        # Valide chaque lignes avant de créer les utilisateurs
        for row_number, row in enumerate(
            csv_reader, start=2
        ):  # start=2 car la première ligne correspond aux headers
            row_serializer = UserCSVRowSerializer(data=row)

            if not row_serializer.is_valid():
                errors.append({"row": row_number, "errors": row_serializer.errors})
            else:
                users_to_create.append(row_serializer.validated_data)

        if errors:
            return Response(
                {
                    "status": "error",
                    "message": "CSV validation failed",
                    "errors": errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        import_id = str(uuid.uuid4())

        process_users.delay(
            import_id,
            users_to_create,
            f"{self.request.user.first_name} {self.request.user.last_name}",
        )

        return Response({"import_id": import_id, "status": "processing"})


@extend_schema_view(
    get=extend_schema(
        responses=ImportStatusSerializer,
        description="Retrieves class import information",
    ),
    post=extend_schema(
        request=ImportSerializer,
        description="Creates a new class import",
        responses=CreateImportResponse,
    ),
)
class ClassBulkImportView(views.APIView):
    http_method_names = ["get", "post"]
    permission_classes = [IsAdmin]

    def get(self, request):
        service = ImportStatusService()

        per_page = request.query_params.get("per_page")
        page = request.query_params.get("page")

        if per_page:
            per_page = int(per_page)
            page = int(page) if page else 1
        else:
            per_page = None
            page = None

        imports, total = service.get_imports(
            type="classes", page=page, per_page=per_page
        )

        serializer = ImportStatusSerializer(imports, many=True)

        response = {"results": serializer.data, "total": total}

        if per_page:
            response.update(
                {
                    "page": page,
                    "per_page": per_page,
                    "total_page": math.ceil(total / per_page),
                }
            )

        return Response(response)

    def post(self, request):
        serializer = ImportSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        csv_file = TextIOWrapper(
            serializer.validated_data["file"].file, encoding="utf-8"
        )

        csv_reader = csv.DictReader(csv_file)
        classes_to_create = []
        errors = []

        # Valide chaque lignes avant de créer les classes
        for row_number, row in enumerate(
            csv_reader, start=2
        ):  # start=2 car la première ligne correspond aux headers
            row_serializer = ClassCSVRowSerializer(data=row)

            if not row_serializer.is_valid():
                errors.append({"row": row_number, "errors": row_serializer.errors})
            else:
                classes_to_create.append(row_serializer.validated_data)

        if errors:
            return Response(
                {
                    "status": "error",
                    "message": "CSV validation failed",
                    "errors": errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        import_id = str(uuid.uuid4())

        process_classes.delay(
            import_id,
            classes_to_create,
            f"{self.request.user.first_name} {self.request.user.last_name}",
        )

        return Response({"import_id": import_id, "status": "processing"})


@extend_schema_view(
    get=extend_schema(
        responses=ImportStatusSerializer,
        description="Retrieves course import information",
    ),
    post=extend_schema(
        request=ImportSerializer,
        description="Creates a new course import",
        responses=CreateImportResponse,
    ),
)
class CourseBulkImportView(views.APIView):
    http_method_names = ["get", "post"]
    permission_classes = [IsAdmin]

    def get(self, request):
        service = ImportStatusService()

        per_page = request.query_params.get("per_page")
        page = request.query_params.get("page")

        if per_page:
            per_page = int(per_page)
            page = int(page) if page else 1
        else:
            per_page = None
            page = None

        imports, total = service.get_imports(
            type="courses", page=page, per_page=per_page
        )

        serializer = ImportStatusSerializer(imports, many=True)

        response = {"results": serializer.data, "total": total}

        if per_page:
            response.update(
                {
                    "page": page,
                    "per_page": per_page,
                    "total_page": math.ceil(total / per_page),
                }
            )

        return Response(response)

    def post(self, request):
        serializer = ImportSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        csv_file = TextIOWrapper(
            serializer.validated_data["file"].file, encoding="utf-8"
        )

        csv_reader = csv.DictReader(csv_file)
        courses_to_create = []
        errors = []

        for row_number, row in enumerate(csv_reader, start=2):
            row_serializer = CourseCSVRowSerializer(data=row)

            if not row_serializer.is_valid():
                errors.append({"row": row_number, "errors": row_serializer.errors})
            else:
                courses_to_create.append(row_serializer.validated_data)

        if errors:
            return Response(
                {
                    "status": "error",
                    "message": "CSV validation failed",
                    "errors": errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        import_id = str(uuid.uuid4())

        process_courses.delay(
            import_id,
            courses_to_create,
            f"{self.request.user.first_name} {self.request.user.last_name}",
        )

        return Response({"import_id": import_id, "status": "processing"})


class ImportDetailView(views.APIView):
    serializer_class = ImportStatusSerializer
    permission_classes = [IsAdmin]

    def get(self, request, import_id):
        service = ImportStatusService()
        import_status = service.get_import_status(import_id)

        serializer = ImportStatusSerializer({**import_status, "import_id": import_id})
        return Response(serializer.data)
