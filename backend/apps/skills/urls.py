from django.urls import path

from .views import (
    SkillListAPIView,
    UserSkillListCreateAPIView,
    UserSkillDetailAPIView,
)


urlpatterns = [

    path(
        "",
        SkillListAPIView.as_view(),
        name="skill-list"
    ),

    path(
        "my-skills/",
        UserSkillListCreateAPIView.as_view(),
        name="user-skills"
    ),

    path(
        "my-skills/<int:pk>/",
        UserSkillDetailAPIView.as_view(),
        name="user-skill-detail"
    ),
]