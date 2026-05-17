from django.urls import path
from .views import GitHubProfileView, GitHubRepositoriesView, GitHubActivityView

urlpatterns = [
    path("profile/", GitHubProfileView.as_view(), name="github-profile"),
    path("repos/", GitHubRepositoriesView.as_view(), name="github-repos"),
    path("activity/", GitHubActivityView.as_view(), name="github-activity"),
]
