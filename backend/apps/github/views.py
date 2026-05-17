from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import GitHubService

class GitHubProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.profile.github_username
        if not username:
            return Response(
                {"error": "GitHub username not set in profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = GitHubService(username)
        profile_response = service.get_profile_with_status()
        
        if profile_response['status'] != 200:
            return Response(
                {"error": f"Failed to fetch GitHub profile. GitHub returned status: {profile_response['status']}"},
                status=profile_response['status'] if profile_response['status'] in [404, 403] else status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response(profile_response['data'])

class GitHubRepositoriesView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.profile.github_username
        if not username:
            return Response(
                {"error": "GitHub username not set in profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = GitHubService(username)
        repos = service.get_repositories()
        return Response(repos)

class GitHubActivityView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.profile.github_username
        if not username:
            return Response(
                {"error": "GitHub username not set in profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = GitHubService(username)
        activity = service.get_contribution_data()
        return Response(activity)
