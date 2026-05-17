from django.conf import settings
from django.db import models

class ActivityLog(models.Model):
    SKILL_ADDED = "SKILL_ADDED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_UPDATED = "PROJECT_UPDATED"
    PROFILE_UPDATED = "PROFILE_UPDATED"
    REPO_IMPORTED = "REPO_IMPORTED"
    PROJECT_COMPLETED = "PROJECT_COMPLETED"
    PROJECT_IN_PROGRESS = "PROJECT_IN_PROGRESS"
    SKILL_SYNC = "SKILL_SYNC"
    SKILL_REMOVED = "SKILL_REMOVED"

    ACTIVITY_CHOICES = [
        (SKILL_ADDED, "Skill Added"),
        (PROJECT_CREATED, "Project Created"),
        (PROJECT_UPDATED, "Project Updated"),
        (PROFILE_UPDATED, "Profile Updated"),
        (REPO_IMPORTED, "Repo Imported"),
        (PROJECT_COMPLETED, "Project Completed"),
        (PROJECT_IN_PROGRESS, "Project In Progress"),
        (SKILL_SYNC, "Skill Telemetry Synchronized"),
        (SKILL_REMOVED, "Skill Removed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activities"
    )
    activity_type = models.CharField(
        max_length=50,
        choices=ACTIVITY_CHOICES
    )
    description = models.TextField()
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"