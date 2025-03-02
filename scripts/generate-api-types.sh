#!/bin/sh

# This script generates the OpenAPI schema for the API.
# Then the schema is used to generate typescript-axios client.

# Generate the API schema from the source code
cd api && uv run manage.py spectacular --file openapi-schema.yml

# Generate the typescript-axios client
cd .. && uvx "openapi-generator-cli[jdk4py]" generate -i api/openapi-schema.yml -g typescript-axios -o client/src/api-client