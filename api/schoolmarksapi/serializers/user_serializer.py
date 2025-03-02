from rest_framework import serializers
from common.users import UserRole, get_user_role
from schoolmarksapi.models import User


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(read_only=True)

    def get_role(self, obj) -> UserRole:
        return get_user_role(obj)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["role"] = self.get_role(instance)
        return ret

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "birthday",
            "phone_number",
            "has_changed_password",
            "role",
        ]


class UserInputSerializer(serializers.ModelSerializer):
    user_role = serializers.ChoiceField(
        choices=["student", "teacher", "admin"], required=True, write_only=True
    )

    def create(self, validated_data):
        # Pop user_role before creating the user
        role = validated_data.pop("user_role", None)

        # Create user with remaining fields
        instance = super().create(validated_data)

        # Set role if provided
        if role is not None:
            if role == "admin":
                instance.is_staff = True
                instance.is_superuser = True
            elif role == "teacher":
                instance.is_staff = True
                instance.is_superuser = False
            elif role == "student":
                instance.is_staff = False
                instance.is_superuser = False
            instance.save()

        return instance

    def update(self, instance, validated_data):
        # Get user_role from validated_data
        role = validated_data.pop("user_role", None)

        # Update other fields first
        instance = super().update(instance, validated_data)

        # Update role if provided
        if role is not None:
            if role == "admin":
                instance.is_staff = True
                instance.is_superuser = True
            elif role == "teacher":
                instance.is_staff = True
                instance.is_superuser = False
            elif role == "student":
                instance.is_staff = False
                instance.is_superuser = False
            instance.save()

        return instance

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "birthday",
            "phone_number",
            "has_changed_password",
            "user_role",
        ]
