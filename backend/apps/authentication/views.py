from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .utils import authenticate_user, generate_otp
from rest_framework.permissions import IsAuthenticated

from .models import User, OTP
from .services import send_otp_email
from .serializers import (
    RegisterSerializer,
    OTPVerificationSerializer,
    SetPasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    LoginSerializer,
    UserSerializer,
)


from apps.projects.models import Project
from apps.skills.models import UserSkill
from apps.analytics.models import ActivityLog
from apps.users.models import UserBadge, UserProfile

class DeleteAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")
        user = request.user
        
        if not user.check_password(password):
            return Response({"error": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Manually clear all related data first to avoid signals creating 'Retired' logs for a dying user
        # (which causes IntegrityError due to foreign key constraints during the deletion transaction)
        Project.objects.filter(user=user).delete()
        UserSkill.objects.filter(user=user).delete()
        ActivityLog.objects.filter(user=user).delete()
        UserBadge.objects.filter(user=user).delete()
        
        # Now safely delete the user (the cascade will have nothing left to do)
        user.delete()
        return Response({"message": "Account and all associated engineering narrative deleted successfully"}, status=status.HTTP_200_OK)

class ResetAccountDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")
        user = request.user
        
        if not user.check_password(password):
            return Response({"error": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Delete Projects and Skills (This will trigger signals that update score and logs)
        Project.objects.filter(user=user).delete()
        UserSkill.objects.filter(user=user).delete()
        
        # 2. Delete ALL Activity Logs (Including the 'Retired' logs created by step 1)
        ActivityLog.objects.filter(user=user).delete()
        
        # 3. Delete All User Badges
        UserBadge.objects.filter(user=user).delete()
        
        # 4. Final Reset of Profile Telemetry
        try:
            profile = user.profile
            profile.depth_score = 0
            profile.streak_count = 0
            profile.featured_badge = None
            # Note: bio, github_username, college_name, and avatar_base64 are PRESERVED
            profile.save()
        except UserProfile.DoesNotExist:
            pass
        
        return Response({"message": "Engineering narrative has been completely reset. Profile details preserved."}, status=status.HTTP_200_OK)

class RegisterAPIView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            email = serializer.validated_data["email"]
            username = serializer.validated_data["username"]

            otp_code = generate_otp()

            OTP.objects.create(
                username=username,
                email=email,
                otp_code=otp_code
            )
            
            send_otp_email(email, otp_code)

            return Response(
                {
                    "message": "OTP generated successfully.",
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        

class VerifyOTPAPIView(APIView):

    def post(self, request):

        serializer = OTPVerificationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            email = serializer.validated_data["email"]
            otp_code = serializer.validated_data["otp_code"]

            try:
                otp_instance = OTP.objects.filter(
                    email=email,
                    otp_code=otp_code,
                    is_verified=False
                ).latest("created_at")

            except OTP.DoesNotExist:

                return Response(
                    {
                        "error": "Invalid OTP."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if otp_instance.is_expired():

                return Response(
                    {
                        "error": "OTP expired."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            otp_instance.is_verified = True
            otp_instance.save()

            return Response(
                {
                    "message": "OTP verified successfully."
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        

class SetPasswordAPIView(APIView):

    def post(self, request):

        serializer = SetPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            try:
                otp_instance = OTP.objects.filter(
                    email=email,
                    is_verified=True
                ).latest("created_at")

            except OTP.DoesNotExist:

                return Response(
                    {
                        "error": "OTP verification required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.create(
                username=otp_instance.username,
                email=email,
            )

            user.set_password(password)
            user.save()

            OTP.objects.filter(email=email).delete()

            return Response(
                {
                    "message": "Account created successfully."
                },
                status=status.HTTP_201_CREATED
            )

        print(serializer.errors)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        

class ForgotPasswordAPIView(APIView):

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = User.objects.get(email=email)

            otp_code = generate_otp()

            OTP.objects.create(
                username=user.username,
                email=email,
                otp_code=otp_code
            )

            send_otp_email(email, otp_code)

            return Response(
                {
                    "message": "OTP sent to registered email address successfully."
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ResetPasswordAPIView(APIView):

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            try:
                OTP.objects.filter(
                    email=email,
                    is_verified=True
                ).latest("created_at")

            except OTP.DoesNotExist:
                return Response(
                    {
                        "error": "OTP verification required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()

            OTP.objects.filter(email=email).delete()

            return Response(
                {
                    "message": "Password reset successfully."
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginAPIView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            login = serializer.validated_data["login"]
            password = serializer.validated_data["password"]

            user = authenticate_user(login, password)

            if user is None:

                return Response(
                    {
                        "error": "Invalid credentials."
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        

class CurrentUserAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )