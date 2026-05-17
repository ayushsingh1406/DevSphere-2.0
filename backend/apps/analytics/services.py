from .models import ActivityLog
from datetime import timedelta
from django.utils.timezone import now
from apps.skills.models import UserSkill
from apps.projects.models import Project

def create_activity_log(
    user,
    activity_type,
    description
):

    ActivityLog.objects.create(
        user=user,
        activity_type=activity_type,
        description=description
    )

    try:
        profile = user.profile
        profile.streak_count = calculate_streak(user)
        profile.depth_score = calculate_depth_score(user)
        profile.save()
    except Exception:
        pass

def calculate_depth_score(user):
    """
    Robust depth score algorithm with diminishing returns.
    Uses logarithmic scaling to ensure growth slows down at higher levels.
    """
    import math
    
    # 1. Activity Points: Logarithmic scaling (Diminishing returns for volume)
    total_activity = ActivityLog.objects.filter(user=user).count()
    activity_score = int(math.log2(total_activity + 1) * 10)
    
    # 2. Skill Points: Proficiency + Logarithmic Experience
    user_skills = UserSkill.objects.filter(user=user)
    skill_score = 0
    # Tiered proficiency rewards
    proficiency_map = {"BEGINNER": 5, "INTERMEDIATE": 15, "ADVANCED": 35}
    
    for us in user_skills:
        skill_score += proficiency_map.get(us.proficiency, 0)
        # Experience: log10 curve (years have diminishing returns)
        skill_score += int(math.log10(us.years_of_experience + 1) * 15)
        # Projects per skill: log2 curve
        skill_score += int(math.log2(us.projects_completed + 1) * 10)
    
    # 3. Project Points: More balanced base and completion rewards
    projects = Project.objects.filter(user=user)
    total_projects = projects.count()
    completed_projects = projects.filter(status="COMPLETED").count()
    
    project_score = (total_projects * 5) + (completed_projects * 15)
    
    # 4. Momentum Points: Tightened streak rewards
    try:
        streak_score = user.profile.streak_count * 2
    except Exception:
        streak_score = 0

    return activity_score + skill_score + project_score + streak_score
    
def calculate_streak(user):
    activity_dates = (
        ActivityLog.objects.filter(user=user)
        .dates("created_at", "day", order="DESC")
    )

    if not activity_dates:
        return 0

    today = now().date()
    latest_activity_date = activity_dates[0]

    if latest_activity_date < today - timedelta(days=1):
        return 0

    streak = 0
    expected_date = latest_activity_date
    for activity_date in activity_dates:
        if activity_date == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        else:
            break

    return streak