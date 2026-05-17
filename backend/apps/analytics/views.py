from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q, Max, Sum
from django.db.models.functions import TruncDate, ExtractHour

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import ActivityLog
from .serializers import (
    HeatmapSerializer, 
    DashboardAnalyticsSerializer,
    ActivityLogSerializer,
    UserBadgeSerializer,
    BadgeSerializer
)

from apps.skills.models import UserSkill
from apps.projects.models import Project
from apps.users.models import UserBadge, Badge

class HeatmapAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activity_data = (
            ActivityLog.objects.filter(user=request.user)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        serializer = HeatmapSerializer(activity_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ActivityHubAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)

        # 1. Engineering Velocity
        velocity_data = (
            ActivityLog.objects.filter(user=user, created_at__date__gte=last_30_days)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        # 2. Badges with Auto-Unlock Logic (Stats needed for effort too)
        all_badges = Badge.objects.all().order_by('category', 'name')
        profile = user.profile
        stats = {
            "streak": profile.streak_count,
            "projects": Project.objects.filter(user=user, status="COMPLETED").count(),
            "skills": UserSkill.objects.filter(user=user).count(),
            "max_hours": UserSkill.objects.filter(user=user).aggregate(Max('hours_practiced'))['hours_practiced__max'] or 0,
            "total_projects": Project.objects.filter(user=user).count(),
            "badges": UserBadge.objects.filter(user=user).count()
        }

        # 3. Effort Allocation (Using real skill hours and project counts)
        skill_hours = UserSkill.objects.filter(user=user).aggregate(Sum('hours_practiced'))['hours_practiced__sum'] or 0
        
        effort_data = [
            {"label": "Skills Mastered", "value": stats["skills"]},
            {"label": "Initiatives", "value": stats["total_projects"]},
            {"label": "Achievements", "value": stats["badges"]},
        ]

        effort_types = [
            ActivityLog.SKILL_ADDED, 
            ActivityLog.PROJECT_CREATED, 
            ActivityLog.PROJECT_UPDATED, 
            ActivityLog.REPO_IMPORTED,
            ActivityLog.PROJECT_COMPLETED,
            ActivityLog.PROJECT_IN_PROGRESS,
            ActivityLog.SKILL_SYNC
        ]

        # 5. Milestone Narrative
        milestones = ActivityLog.objects.filter(
            user=user, 
            activity_type__in=effort_types
        ).order_by("-created_at")[:15]

        # 6. Hourly Heatmap (15 Days)
        fifteen_days_ago = today - timedelta(days=14)
        multi_day_activity = (
            ActivityLog.objects.filter(user=user, created_at__date__gte=fifteen_days_ago)
            .annotate(date=TruncDate("created_at"), hour=ExtractHour("created_at"))
            .values("date", "hour")
            .annotate(count=Count("id"))
            .order_by("date", "hour")
        )

        # Organize into a structured dict for the frontend
        hourly_15d = {}
        for day_offset in range(15):
            d = fifteen_days_ago + timedelta(days=day_offset)
            date_str = d.strftime("%Y-%m-%d")
            hourly_15d[date_str] = [0] * 24

        for entry in multi_day_activity:
            date_str = entry["date"].strftime("%Y-%m-%d")
            if date_str in hourly_15d:
                hourly_15d[date_str][entry["hour"]] = entry["count"]

        # Convert back to sorted list for response
        hourly_15d_list = [{"date": d, "hours": h} for d, h in sorted(hourly_15d.items())]

        badge_list = []
        for badge in all_badges:
            b_data = BadgeSerializer(badge).data
            target = 1
            current = 0
            req_text = ""

            if badge.slug == 'rookie-engineer':
                target, current, req_text = 1, 1, "Welcome to DevSphere"
            elif badge.slug == 'intermediate-architect':
                target, current, req_text = 10, stats["total_projects"], "Complete 10 projects"
            elif badge.slug == 'legendary-founder':
                target, current, req_text = 25, stats["total_projects"], "Complete 25 projects"
            elif badge.slug == 'consistency-king':
                target, current, req_text = 7, stats["streak"], "Maintain a 7-day streak"
            elif badge.slug == 'atomic-habit':
                target, current, req_text = 30, stats["streak"], "Maintain a 30-day streak"
            elif badge.slug == 'builder-first':
                target, current, req_text = 1, stats["projects"], "Complete your first project"
            elif badge.slug == 'project-maven':
                target, current, req_text = 5, stats["projects"], "Complete 5 projects"
            elif badge.slug == 'polyglot':
                target, current, req_text = 5, stats["skills"], "Add 5 distinct skills"
            elif badge.slug == 'deep-learner':
                target, current, req_text = 100, stats["max_hours"], "100 hours in a single skill"
            elif badge.slug == 'repo-master':
                target, current, req_text = 10, stats["projects"], "Link 10 repositories"
            elif badge.slug == 'pioneer':
                target, current, req_text = 1, 1, "Early Access Member"

            is_completed = current >= target
            
            # Auto-award if completed
            ub = None
            try:
                ub = UserBadge.objects.filter(user=user, badge=badge).first()
                if is_completed and not ub:
                    ub = UserBadge.objects.create(user=user, badge=badge)
            except Exception as e:
                print(f"DEBUG: Badge award error for {badge.slug}: {e}")

            b_data['progress'] = {
                'current': min(current, target),
                'target': target,
                'percentage': min(round((current / target) * 100 if target > 0 else 0, 1), 100),
                'requirement': req_text
            }
            b_data['awarded_at'] = ub.awarded_at if ub else None
            b_data['is_showcased'] = ub.is_showcased if ub else False
            badge_list.append(b_data)

        return Response({
            "velocity": list(velocity_data),
            "effort": list(effort_data),
            "milestones": ActivityLogSerializer(milestones, many=True).data,
            "hourly": hourly_15d_list,
            "all_badges": badge_list,
        })

class ToggleShowcaseBadgeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        badge_id = request.data.get("badge_id")
        
        ub = UserBadge.objects.filter(user=user, badge_id=badge_id).first()
        if not ub:
            return Response({"error": "You haven't unlocked this badge yet"}, status=status.HTTP_400_BAD_REQUEST)

        # Toggle state
        ub.is_showcased = not ub.is_showcased
        ub.save()
        
        return Response({
            "status": "updated",
            "is_showcased": ub.is_showcased,
            "badge_name": ub.badge.name
        })

class DashboardAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        total_skills = UserSkill.objects.filter(user=user).count()
        total_projects = Project.objects.filter(user=user).count()
        completed_projects = Project.objects.filter(user=user, status="COMPLETED").count()
        activity_count = ActivityLog.objects.filter(user=user).count()

        # Award Pioneer and Rookie badges
        for slug in ["pioneer", "rookie-engineer"]:
            try:
                badge = Badge.objects.filter(slug=slug).first()
                if badge and not UserBadge.objects.filter(user=user, badge=badge).exists():
                    ub = UserBadge.objects.create(user=user, badge=badge)
                    if slug == "rookie-engineer":
                        ub.is_showcased = True
                        ub.save()
            except Exception as e:
                print(f"DEBUG: Default badge error for {slug}: {e}")

        dashboard_data = {
            "depth_score": profile.depth_score,
            "streak_count": profile.streak_count,
            "total_skills": total_skills,
            "total_projects": total_projects,
            "completed_projects": completed_projects,
            "activity_count": activity_count,
            "showcased_badges": UserBadgeSerializer(UserBadge.objects.filter(user=user, is_showcased=True), many=True).data
        }
        serializer = DashboardAnalyticsSerializer(dashboard_data)
        return Response(serializer.data, status=status.HTTP_200_OK)