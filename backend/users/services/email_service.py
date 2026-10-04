import os
from html import escape

import resend


def send_welcome_email(user):
    resend.api_key = os.environ.get("RESEND_API_KEY")

    if not resend.api_key:
        raise ValueError(
            "RESEND_API_KEY is not configured."
        )

    frontend_url = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:5173",
    ).rstrip("/")

    first_name = escape(
        user.first_name.strip()
        if user.first_name
        else user.email
    )

    login_url = f"{frontend_url}/login"

    resend.Emails.send(
        {
            "from": os.environ.get(
                "DEFAULT_FROM_EMAIL",
                "HarvestCoin <onboarding@resend.dev>",
            ),
            "to": [user.email],
            "subject": "Welcome to HarvestCoin",
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
                        Welcome to HarvestCoin.
                    </h1>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        Hello {first_name},
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        Your HarvestCoin account has been
                        created successfully. We're glad
                        to have you with us.
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.7;
                    ">
                        You can now log in and continue
                        setting up your account.
                    </p>

                    <div style="margin: 32px 0;">
                        <a
                            href="{login_url}"
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
                            Log in to HarvestCoin
                        </a>
                    </div>

                    <p style="
                        font-size: 13px;
                        color: #777777;
                        line-height: 1.6;
                    ">
                        If you did not create this account,
                        please contact HarvestCoin support.
                    </p>

                    <p style="
                        font-size: 14px;
                        margin-top: 35px;
                    ">
                        © 2026 HarvestCoin
                    </p>
                </div>
            """,
        }
    )