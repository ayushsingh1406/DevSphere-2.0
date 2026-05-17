from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
    
class OTP(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        expiry_time = self.created_at + timezone.timedelta(minutes=5)
        return timezone.now() > expiry_time

    def __str__(self):
        return f"{self.email} - {self.otp_code}"