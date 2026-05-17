from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/auth/",
        include("apps.authentication.urls")
    ),
    path(
        "api/users/",
        include("apps.users.urls")
    ),
    path(
        "api/skills/",
        include("apps.skills.urls")
    ),
    path(
        "api/projects/",
        include("apps.projects.urls")
    ),
    path(
        "api/analytics/",
        include("apps.analytics.urls")
    ),
    path(
        "api/github/",
        include("apps.github.urls")
    ),
]