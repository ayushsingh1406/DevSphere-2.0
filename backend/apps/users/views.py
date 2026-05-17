from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from apps.analytics.models import ActivityLog

from .serializers import UserProfileSerializer, LeaderboardSerializer
from .models import UserProfile


class UserProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserProfileSerializer(
            request.user.profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):

        serializer = UserProfileSerializer(
            request.user.profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        print(f"DEBUG: Profile Update Validation Errors: {serializer.errors}")
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        
class LeaderboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)

        # 1. Global Leaderboard (Depth Score)
        global_profiles = UserProfile.objects.order_by("-depth_score")[:20]
        global_data = LeaderboardSerializer(global_profiles, many=True).data
        for idx, item in enumerate(global_data): item["rank"] = idx + 1

        # 2. Weekly Leaderboard (Activity Logs in last 7 days)
        weekly_activity = (
            ActivityLog.objects.filter(created_at__gte=week_start)
            .values("user__id")
            .annotate(score=Count("id"))
            .order_by("-score")[:20]
        )
        weekly_data = []
        for idx, entry in enumerate(weekly_activity):
            try:
                profile = UserProfile.objects.select_related('user').get(user_id=entry["user__id"])
                weekly_data.append({
                    "rank": idx + 1,
                    "username": profile.user.username,
                    "display_name": f"{profile.user.first_name} {profile.user.last_name}".strip() or profile.user.username,
                    "score": entry["score"],
                    "avatar_base64": profile.avatar_base64 or ""
                })
            except UserProfile.DoesNotExist:
                continue

        # 3. Today's Top Performer (Activity Logs today)
        today_activity = (
            ActivityLog.objects.filter(created_at__gte=today_start)
            .values("user__id")
            .annotate(score=Count("id"))
            .order_by("-score")[:1]
        )
        today_top = None
        if today_activity:
            try:
                p = UserProfile.objects.select_related('user').get(user_id=today_activity[0]["user__id"])
                today_top = {
                    "username": p.user.username,
                    "score": today_activity[0]["score"],
                    "avatar_base64": p.avatar_base64 or ""
                }
            except UserProfile.DoesNotExist:
                pass

        # 4. Streak Leaderboard
        streak_profiles = UserProfile.objects.order_by("-streak_count")[:20]
        streak_data = LeaderboardSerializer(streak_profiles, many=True).data
        for idx, item in enumerate(streak_data): 
            item["rank"] = idx + 1
            item["score"] = item["streak_count"]

        return Response({
            "global": global_data,
            "weekly": weekly_data,
            "today": today_top,
            "streaks": streak_data
        }, status=status.HTTP_200_OK)

class PublicProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            profile = UserProfile.objects.select_related('user').get(user__username=username)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
