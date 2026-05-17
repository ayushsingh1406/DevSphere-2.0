from django.conf import settings
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    bio = models.TextField(blank=True)
    github_username = models.CharField(
        max_length=255,
        blank=True
    )
    college_name = models.CharField(
        max_length=255,
        blank=True
    )
    avatar_base64 = models.TextField(blank=True, null=True)
    depth_score = models.IntegerField(default=0)
    streak_count = models.IntegerField(default=0)
    featured_badge = models.ForeignKey(
        'Badge',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="featured_on_profiles"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

class Badge(models.Model):
    CATEGORY_CHOICES = [
        ("LEVEL", "Level"),
        ("STREAK", "Streak"),
        ("PROJECT", "Project"),
        ("SPECIAL", "Special"),
    ]
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    rarity = models.CharField(max_length=20, default="COMMON")

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="badges"
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE
    )
    is_showcased = models.BooleanField(default=False)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "badge")

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"