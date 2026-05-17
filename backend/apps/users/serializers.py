from rest_framework import serializers

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True
    )

    skills_count = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    avatar_base64 = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = UserProfile

        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "github_username",
            "college_name",
            "avatar_base64",
            "depth_score",
            "streak_count",
            "featured_badge",
            "skills_count",
            "projects_count",
            "created_at",
        ]

        read_only_fields = [
            "depth_score",
            "streak_count",
            "featured_badge",
            "skills_count",
            "projects_count",
            "created_at",
        ]

    def to_representation(self, instance):
        # Dynamically sync streak to handle silent/inactive days
        from apps.analytics.services import calculate_streak, calculate_depth_score
        try:
            fresh_streak = calculate_streak(instance.user)
            if fresh_streak != instance.streak_count:
                instance.streak_count = fresh_streak
                instance.depth_score = calculate_depth_score(instance.user)
                instance.save(update_fields=['streak_count', 'depth_score'])
        except Exception as e:
            print(f"DEBUG: Error syncing streak in UserProfileSerializer: {e}")

        ret = super().to_representation(instance)
        if instance.featured_badge:
            ret['featured_badge'] = {
                'name': instance.featured_badge.name,
                'icon_name': instance.featured_badge.icon_name,
                'category': instance.featured_badge.category,
                'rarity': instance.featured_badge.rarity
            }
        return ret

    def get_skills_count(self, obj):
        return obj.user.user_skills.count()

    def get_projects_count(self, obj):
        return obj.user.projects.count()

    def update(self, instance, validated_data):
        # Handle the nested user fields manually
        user_data = validated_data.pop('user', {})
        user = instance.user

        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        
        user.save()

        # Update the rest of the profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
        

class LeaderboardSerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    github_username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = UserProfile

        fields = [
            "username",
            "first_name",
            "last_name",
            "github_username",
            "depth_score",
            "streak_count",
            "avatar_base64",
        ]