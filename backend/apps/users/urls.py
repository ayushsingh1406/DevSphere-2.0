from django.urls import path
from .views import UserProfileAPIView, LeaderboardAPIView, PublicProfileAPIView

urlpatterns = [
    path(
        "me/",
        UserProfileAPIView.as_view(),
        name="profile"
    ),
    
    path(
        "leaderboard/",
        LeaderboardAPIView.as_view(),
        name="leaderboard"
    ),

    path(
        "profile/<str:username>/",
        PublicProfileAPIView.as_view(),
        name="public_profile"
    ),
]