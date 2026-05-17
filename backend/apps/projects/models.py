from django.conf import settings
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Project(models.Model):

    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

    STATUS_CHOICES = [
        (PLANNING, "Planning"),
        (IN_PROGRESS, "In Progress"),
        (COMPLETED, "Completed"),
    ]

    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

    DIFFICULTY_CHOICES = [
        (BEGINNER, "Beginner"),
        (INTERMEDIATE, "Intermediate"),
        (ADVANCED, "Advanced"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    tech_stack = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PLANNING)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default=BEGINNER)
    progress_percentage = models.PositiveIntegerField(default=0)
    
    is_starred = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


@receiver(post_save, sender=Project)
@receiver(post_delete, sender=Project)
def handle_project_change(sender, instance, **kwargs):
    """
    Robustly update telemetry and depth score on project changes or deletion.
    """
    from apps.analytics.services import calculate_depth_score, create_activity_log
    
    # Update profile
    try:
        profile = instance.user.profile
        profile.depth_score = calculate_depth_score(instance.user)
        profile.save()
    except Exception:
        # Profile might have been deleted already (e.g. during account deletion cascade)
        pass

    if kwargs.get('created', False):
        create_activity_log(
            user=instance.user,
            activity_type="PROJECT_CREATED",
            description=f"Initialized initiative: {instance.title}"
        )
    elif 'created' not in kwargs: # Delete case
        create_activity_log(
            user=instance.user,
            activity_type="PROJECT_REMOVED",
            description=f"Retired initiative: {instance.title}"
        )