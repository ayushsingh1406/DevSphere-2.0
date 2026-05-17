from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Skill, UserSkill
from .serializers import (
    SkillSerializer,
    UserSkillSerializer,
)


class SkillListAPIView(generics.ListAPIView):

    queryset = Skill.objects.all()

    serializer_class = SkillSerializer

    permission_classes = [IsAuthenticated]


class UserSkillListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = UserSkillSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return UserSkill.objects.filter(
            user=self.request.user
        ).order_by('id')

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        print(f"DEBUG: Skill Creation Validation Errors: {serializer.errors}")
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class UserSkillDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(
            user=self.request.user
        )