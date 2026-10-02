from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

import resend


def send_password_reset_email(user):
    resend.api_key = settings.RESEND_API_KEY

    if not resend.api_key:
        raise ValueError("RESEND_API_KEY is not configured.")

    uid = urlsafe_base64_encode(force_bytes(user.pk))

    token = default_token_generator.make_token(user)

    reset_url = (
        f"http://localhost:5173/reset-password/"
        f"{uid}/{token}/"
    )

    resend.Emails.send(
        {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [user.email],
            "subject": "Reset your Baloz password",
            "html": f"""
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 24px;
                    color: #171717;
                ">
                    <h1 style="
                        font-size: 32px;
                        margin-bottom: 20px;
                    ">
                        Reset your password.
                    </h1>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        Hello {user.first_name or user.email},
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        We received a request to reset the password
                        for your Baloz account.
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        Click the button below to create a new password.
                    </p>

                    <div style="margin: 32px 0;">
                        <a
                            href="{reset_url}"
                            style="
                                display: inline-block;
                                padding: 14px 24px;
                                background: #111111;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 15px;
                            "
                        >
                            Reset password
                        </a>
                    </div>

                    <p style="
                        font-size: 13px;
                        color: #777777;
                        line-height: 1.6;
                    ">
                        This password reset link is temporary and
                        can only be used for your account.
                    </p>

                    <p style="
                        font-size: 13px;
                        color: #777777;
                        line-height: 1.6;
                    ">
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p style="
                        font-size: 14px;
                        margin-top: 35px;
                    ">
                        © 2026 Baloz
                    </p>
                </div>
            """,
        }
    )