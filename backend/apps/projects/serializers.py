from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project

        fields = [
            "id",
            "title",
            "description",
            "github_url",
            "live_url",
            "tech_stack",
            "status",
            "difficulty",
            "progress_percentage",
            "is_starred",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
        ]

    def validate_github_url(self, value):
        if not value:
            return value
            
        user = self.context["request"].user
        queryset = Project.objects.filter(user=user, github_url=value)
        
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
            
        if queryset.exists():
            raise serializers.ValidationError("Project already imported from this GitHub repository.")
            
        return value

    def create(self, validated_data):

        user = self.context["request"].user

        return Project.objects.create(
            user=user,
            **validated_data
        )