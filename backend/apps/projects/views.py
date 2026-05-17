from rest_framework import generics,status
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

from .github_services import (
    fetch_github_profile,
    fetch_github_repositories,
)

class ProjectListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = ProjectSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Project.objects.filter(
            user=self.request.user
        ).order_by("-created_at")



class ProjectDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ProjectSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Project.objects.filter(
            user=self.request.user
        )
        
class GitHubProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, username):

        profile_data = fetch_github_profile(
            username
        )

        if profile_data is None:

            return Response(
                {
                    "error": "GitHub user not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        repositories = fetch_github_repositories(
            username
        )

        return Response(
            {
                "profile": profile_data,
                "repositories": repositories,
            },
            status=status.HTTP_200_OK
        )