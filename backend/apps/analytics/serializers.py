from rest_framework import serializers
from apps.users.models import Badge, UserBadge
from .models import ActivityLog

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer()
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'is_showcased', 'awarded_at']

class DashboardAnalyticsSerializer(serializers.Serializer):
    depth_score = serializers.IntegerField()
    streak_count = serializers.IntegerField()
    total_skills = serializers.IntegerField()
    total_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    activity_count = serializers.IntegerField()
    showcased_badges = UserBadgeSerializer(many=True)

class HeatmapSerializer(serializers.Serializer):
    date = serializers.DateField()
    count = serializers.IntegerField()

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'