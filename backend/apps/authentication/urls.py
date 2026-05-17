from django.urls import path
from .views import (
    RegisterAPIView,
    VerifyOTPAPIView,
    SetPasswordAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    LoginAPIView,
    CurrentUserAPIView,
    DeleteAccountAPIView,
    ResetAccountDataAPIView,
)


urlpatterns = [
    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register"
    ),

    path(
        "verify-otp/",
        VerifyOTPAPIView.as_view(),
        name="verify-otp"
    ),
    
    path(
        "set-password/",
        SetPasswordAPIView.as_view(),
        name="set-password"
    ),

    path(
        "forgot-password/",
        ForgotPasswordAPIView.as_view(),
        name="forgot-password"
    ),

    path(
        "reset-password/",
        ResetPasswordAPIView.as_view(),
        name="reset-password"
    ),
    
    path(
        "login/",
        LoginAPIView.as_view(),
        name="login"
    ),
    
    path(
        "me/",
        CurrentUserAPIView.as_view(),
        name="current-user"
    ),
    path(
        "delete-account/",
        DeleteAccountAPIView.as_view(),
        name="delete-account"
    ),
    path(
        "reset-data/",
        ResetAccountDataAPIView.as_view(),
        name="reset-data"
    ),
]