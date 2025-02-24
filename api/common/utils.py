import json
from typing import Dict, List, Literal, Optional, Tuple
import redis
from rest_framework.authentication import SessionAuthentication
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from uuid import UUID
import hmac
import time
import base64
import hashlib
import struct
import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class TOTP:
    def __init__(self, interval=15):
        self.interval = interval

    def generate_secret(self):
        return base64.b32encode(os.urandom(20)).decode("utf-8")

    def generate_token(self, secret):
        # Calculate the time-based counter (T = Current Unix time / 15-second interval)
        counter = int(time.time() / self.interval)

        # Convert counter to 8-byte big-endian representation (required by RFC 6238)
        # '>Q' format: '>' means big-endian, 'Q' means unsigned long long (8 bytes)
        counter_bytes = struct.pack(">Q", counter)

        # Decode the base32-encoded secret key
        # TOTP secrets are usually stored in base32 format for user-friendliness
        key = base64.b32decode(secret)

        # Calculate HMAC-SHA1 hash
        # This creates a 20-byte (160-bit) hash value
        hmac_obj = hmac.new(key, counter_bytes, hashlib.sha1)
        hmac_result = hmac_obj.digest()

        # Dynamic Truncation (DT) as defined in RFC 4226
        # Get offset from last byte (last 4 bits)
        offset = hmac_result[-1] & 0x0F  # 0x0F = 15 (get last 4 bits)

        # Take 4 bytes starting at offset
        code_bytes = hmac_result[offset : offset + 4]

        # Convert 4 bytes to 32-bit integer
        # '>I' format: '>' means big-endian, 'I' means unsigned int (4 bytes)
        code = struct.unpack(">I", code_bytes)[0]

        # Remove the most significant bit (RFC 4226 section 5.4)
        # 0x7FFFFFFF = 2147483647 (31-bit mask)
        code = code & 0x7FFFFFFF

        # Get 6 digits by calculating modulus 1000000
        # zfill(6) ensures the code is always 6 digits with leading zeros
        return str(code % 1000000).zfill(6)

    def verify_token(self, secret, token):
        current_token = self.generate_token(secret)
        return token == current_token


def is_valid_uuid(uuid_to_test, version=4):
    """
    Check if uuid_to_test is a valid UUID.

     Parameters
    ----------
    uuid_to_test : str
    version : {1, 2, 3, 4}

     Returns
    -------
    `True` if uuid_to_test is a valid UUID, otherwise `False`.

     Examples
    --------
    >>> is_valid_uuid('c9bf9e57-1685-4c89-bafb-ff5af830be8a')
    True
    >>> is_valid_uuid('c9bf9e58')
    False
    """

    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


class CsrfExemptSessionAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "common.utils.CsrfExemptSessionAuthentication"
    name = "CsrfExemptSessionAuthentication"

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": "sessionid",
        }


class NumberAndSpecialCharValidator:
    def validate(self, password, user=None):
        if not any(char.isdigit() for char in password):
            raise ValidationError(
                _("Password must contain at least one number."),
                code="password_no_number",
            )

        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(char in special_chars for char in password):
            raise ValidationError(
                _("Password must contain at least one special character."),
                code="password_no_special_char",
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least one number and one special character."
        )


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
