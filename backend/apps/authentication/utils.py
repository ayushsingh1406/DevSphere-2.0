import random
from django.contrib.auth import authenticate
from .models import User

def generate_otp():
    return str(random.randint(100000, 999999))

def authenticate_user(login, password):

    user = User.objects.filter(email=login).first()

    if user is None:
        user = User.objects.filter(username=login).first()

    if user:
        authenticated_user = authenticate(
            username=user.username,
            password=password
        )

        return authenticated_user

    return None