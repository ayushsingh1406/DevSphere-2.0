import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
sys.path.append(os.getcwd())
django.setup()

from apps.users.models import Badge

badges = [
    # Level Badges
    {
        "name": "Rookie Engineer",
        "slug": "rookie-engineer",
        "description": "Welcome to the DevSphere. Your journey begins here.",
        "icon_name": "Zap",
        "category": "LEVEL",
        "rarity": "COMMON"
    },
    {
        "name": "Intermediate Architect",
        "slug": "intermediate-architect",
        "description": "You've built enough narratives to understand the patterns.",
        "icon_name": "Layers",
        "category": "LEVEL",
        "rarity": "RARE"
    },
    {
        "name": "Legendary Founder",
        "slug": "legendary-founder",
        "description": "Master of multiple narratives and high-impact projects.",
        "icon_name": "Crown",
        "category": "LEVEL",
        "rarity": "LEGENDARY"
    },
    # Streak Badges
    {
        "name": "Consistency King",
        "slug": "consistency-king",
        "description": "Maintain a 7-day engineering streak.",
        "icon_name": "Flame",
        "category": "STREAK",
        "rarity": "RARE"
    },
    {
        "name": "Atomic Habit",
        "slug": "atomic-habit",
        "description": "Maintain a 30-day engineering streak.",
        "icon_name": "Trophy",
        "category": "STREAK",
        "rarity": "EPIC"
    },
    # Project Badges
    {
        "name": "Builder First",
        "slug": "builder-first",
        "description": "Successfully completed your first full project.",
        "icon_name": "Box",
        "category": "PROJECT",
        "rarity": "COMMON"
    },
    {
        "name": "Project Maven",
        "slug": "project-maven",
        "description": "Complete 5 distinct engineering projects.",
        "icon_name": "Package",
        "category": "PROJECT",
        "rarity": "RARE"
    },
    # Skill Badges
    {
        "name": "Polyglot",
        "slug": "polyglot",
        "description": "Add 5 different engineering skills to your workspace.",
        "icon_name": "Terminal",
        "category": "SPECIAL",
        "rarity": "RARE"
    },
    {
        "name": "Deep Learner",
        "slug": "deep-learner",
        "description": "Accumulate 100 practice hours in a single skill.",
        "icon_name": "BookOpen",
        "category": "SPECIAL",
        "rarity": "EPIC"
    },
    # GitHub Badges
    {
        "name": "Repo Master",
        "slug": "repo-master",
        "description": "Have 10+ public repositories on GitHub.",
        "icon_name": "GitBranch",
        "category": "SPECIAL",
        "rarity": "RARE"
    },
    # Special Badges
    {
        "name": "Pioneer",
        "slug": "pioneer",
        "description": "The first badge awarded to every DevSphere explorer.",
        "icon_name": "Sparkles",
        "category": "SPECIAL",
        "rarity": "COMMON"
    }
]

for b in badges:
    Badge.objects.update_or_create(
        slug=b['slug'],
        defaults=b
    )

print("Badges updated successfully!")
