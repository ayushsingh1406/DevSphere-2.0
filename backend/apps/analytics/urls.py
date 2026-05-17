from django.urls import path
from .views import HeatmapAPIView, DashboardAnalyticsAPIView, ActivityHubAPIView, ToggleShowcaseBadgeAPIView

urlpatterns = [
    path("heatmap/", HeatmapAPIView.as_view(), name="heatmap"),
    path("dashboard/", DashboardAnalyticsAPIView.as_view(), name="dashboard-analytics"),
    path("hub/", ActivityHubAPIView.as_view(), name="activity-hub"),
    path("badge/toggle-showcase/", ToggleShowcaseBadgeAPIView.as_view(), name="toggle-showcase-badge"),
]