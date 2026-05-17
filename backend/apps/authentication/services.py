from django.core.mail import send_mail
from decouple import config


def send_otp_email(email, otp_code):

    subject = "DevSphere OTP Verification"

    message = (
        f"Your DevSphere OTP is: {otp_code}\n\n"
        "This OTP will expire in 5 minutes."
    )

    from_email = config("EMAIL_HOST_USER")

    send_mail(
        subject,
        message,
        from_email,
        [email],
        fail_silently=False,
    )