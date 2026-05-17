from django.conf import settings
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils.timezone import now

class Skill(models.Model):

    name = models.CharField(
        max_length=255,
        unique=True
    )

    description = models.TextField(blank=True)

    category = models.CharField(
        max_length=255,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):

    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

    PROFICIENCY_CHOICES = [
        (BEGINNER, "Beginner"),
        (INTERMEDIATE, "Intermediate"),
        (ADVANCED, "Advanced"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_skills"
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="user_skills"
    )

    proficiency = models.CharField(
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        default=BEGINNER
    )

    years_of_experience = models.PositiveIntegerField(
        default=0
    )

    projects_completed = models.PositiveIntegerField(
        default=0
    )

    hours_practiced = models.PositiveIntegerField(
        default=0
    )
    
    started_learning_date = models.DateField(
        default=now
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "skill")

    def __str__(self):
        return f"{self.user.username} - {self.skill.name}"

    def save(self, *args, **kwargs):
        """
        Dynamically update proficiency based on hours_practiced.
        0-50: Beginner
        51-150: Intermediate
        151+: Advanced
        """
        hours = self.hours_practiced or 0
        if hours <= 50:
            self.proficiency = self.BEGINNER
        elif hours <= 150:
            self.proficiency = self.INTERMEDIATE
        else:
            self.proficiency = self.ADVANCED
        super().save(*args, **kwargs)


@receiver(post_save, sender=UserSkill)
@receiver(post_delete, sender=UserSkill)
def handle_userskill_change(sender, instance, **kwargs):
    """
    Robustly recalculate depth score whenever a skill is added, updated, or removed.
    """
    from apps.analytics.services import calculate_depth_score, create_activity_log
    
    # Update profile score
    try:
        profile = instance.user.profile
        profile.depth_score = calculate_depth_score(instance.user)
        profile.save()
    except Exception:
        # Profile might have been deleted already (e.g. during account deletion cascade)
        pass

    # Log activity
    if 'created' in kwargs: # Save case (create or update)
        activity_desc = f"Synchronized skill telemetry for {instance.skill.name}"
        if kwargs.get('created', False):
            activity_type = "SKILL_ADDED"
            activity_desc = f"Initialized {instance.skill.name} in engineering workspace"
        else:
            activity_type = "SKILL_SYNC"

        create_activity_log(
            user=instance.user,
            activity_type=activity_type,
            description=activity_desc
        )
    else: # Delete case
        create_activity_log(
            user=instance.user,
            activity_type="SKILL_REMOVED",
            description=f"Removed skill from workspace: {instance.skill.name}"
        )