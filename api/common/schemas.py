def preprocess_schema(endpoints, **kwargs):
    schemas = kwargs["components"]["schemas"]

    # 1. First, define the nested schemas
    schemas["UserImportItem"] = {
        "type": "object",
        "properties": {
            "first_name": {"type": "string"},
            "last_name": {"type": "string"},
            "email": {"type": "string", "format": "email"},
            "temp_password": {"type": "string"},
        },
        "required": ["first_name", "last_name", "email", "temp_password"],
    }

    schemas["ClassImportItem"] = {
        "type": "object",
        "properties": {
            "id": {"type": "string", "format": "uuid"},
            "name": {"type": "string"},
            "code": {"type": "string"},
            "email": {"type": "string", "format": "email"},
            "year_of_graduation": {"type": "integer"},
        },
        "required": ["id", "name", "code", "email", "year_of_graduation"],
    }

    schemas["CourseImportItem"] = {
        "type": "object",
        "properties": {
            "id": {"type": "string", "format": "uuid"},
            "name": {"type": "string"},
            "code": {"type": "string"},
            "professor": {"type": "string", "nullable": True},
            "professor_email": {"type": "string", "format": "email"},
        },
        "required": ["id", "name", "code", "professor_email"],
    }

    # 2. Update the ImportStatus schema
    if "ImportStatus" in schemas:
        schemas["ImportStatus"]["properties"]["results"] = {
            "oneOf": [
                {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/UserImportItem"},
                },
                {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/ClassImportItem"},
                },
                {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/CourseImportItem"},
                },
            ]
        }

    return endpoints
