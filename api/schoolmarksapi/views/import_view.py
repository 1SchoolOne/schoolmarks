import math
from rest_framework import status, views
from rest_framework.response import Response
import csv
import os
from io import TextIOWrapper
import uuid
import redis
import json
from typing import Dict, List, Literal, Optional, Tuple
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


class ImportStatusService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.environ.get("TASK_REDIS_HOST"),  # Configure based on your settings
            port=int(os.environ.get("TASK_REDIS_PORT")),
            decode_responses=True,
        )

    def get_all_import_keys(self) -> List[str]:
        """Get all import IDs by scanning for status keys"""
        import_keys = []
        cursor = 0

        while True:
            cursor, keys = self.redis_client.scan(cursor, match="import_*")
            import_keys.extend(keys)

            if cursor == 0:
                break

        # Extract import IDs from keys
        return [key.split("_")[1] for key in import_keys]

    def get_import_status(self, import_id: str) -> Optional[Dict]:
        data = self.redis_client.get(f"import_{import_id}")
        if not data:
            return None

        import_data = json.loads(data)

        if import_data.get("results") and isinstance(import_data["results"], str):
            import_data["results"] = json.loads(import_data["results"])

        return import_data

    def get_imports(
        self,
        type: Literal["users", "classes", "courses"],
        page: Optional[int] = None,
        per_page: Optional[int] = None,
    ) -> Tuple[List[Dict], int]:
        # Get all import keys
        cursor = 0
        import_keys: List[str] = []

        while True:
            cursor, key = self.redis_client.scan(cursor, "import_*")
            import_keys.extend(key)

            if cursor == 0:
                break

        # Get all imports
        processing: List[Dict] = []
        completed: List[Dict] = []

        for key in import_keys:
            import_id = key.split("_")[1]
            import_data = self.get_import_status(import_id)

            if not import_data:
                continue

            if import_data["type"] != type:
                continue

            data = {**import_data, "import_id": import_id}

            if import_data["status"] == "processing":
                processing.append(data)
            else:
                if not data.get("finished_at"):
                    data["finished_at"] = data.get("started_at", 0)
                completed.append(data)

        # Sort by finished_at descending
        processing.sort(key=lambda x: x.get("started_at", ""), reverse=True)
        completed.sort(key=lambda x: x.get("finished_at", 0), reverse=True)

        imports: List[Dict] = processing + completed

        total = len(imports)

        # Handle pagination
        if page is not None and per_page is not None:
            start = (page - 1) * per_page
            end = start + per_page
            imports[start:end]

        return imports, total


@extend_schema_view(
    get=extend_schema(
        responses=ImportStatusSerializer,
        description="Retrieves user import information",
    ),
    post=extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"},
                },
            }
        },
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
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"},
                },
            }
        },
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
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"},
                },
            }
        },
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
