from django.urls import path

from .views import (
    ProjectListCreateAPIView,
    ProjectDetailAPIView,
    GitHubProfileAPIView,
)


urlpatterns = [

    path(
        "",
        ProjectListCreateAPIView.as_view(),
        name="project-list-create"
    ),

    path(
        "<int:pk>/",
        ProjectDetailAPIView.as_view(),
        name="project-detail"
    ),
    
    path(
        "github/<str:username>/",
        GitHubProfileAPIView.as_view(),
        name="github-profile"
    ),
]