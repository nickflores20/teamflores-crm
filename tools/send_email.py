#!/usr/bin/env python3
"""
send_email.py
Sends an email via the Gmail API using OAuth 2.0.
Credentials are loaded from .env.

Usage:
    python tools/send_email.py \
        --to "nick@example.com" \
        --subject "New Lead: John Smith" \
        --html "<h1>New lead!</h1><p>Details...</p>" \
        --text "New lead! Details..."
"""

import os
import sys
import json
import base64
import argparse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

GMAIL_SENDER = os.getenv("GMAIL_SENDER")
TOKEN_PATH = os.getenv("TOKEN_PATH", "token.json")

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(
                f"No valid Gmail credentials found at {TOKEN_PATH}. "
                "Run the OAuth flow to generate a token."
            )
    return creds


def build_message(to, subject, html_body, text_body):
    """Construct a MIME multipart/alternative email message."""
    msg = MIMEMultipart("alternative")
    msg["From"] = GMAIL_SENDER
    msg["To"] = to
    msg["Subject"] = subject

    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return {"raw": raw}


def send_email(to, subject, html_body, text_body=""):
    if not GMAIL_SENDER:
        print(json.dumps({"error": "GMAIL_SENDER not set in .env"}), file=sys.stderr)
        sys.exit(1)

    if not to:
        print(json.dumps({"error": "Recipient email (--to) is required"}), file=sys.stderr)
        sys.exit(1)

    if not html_body:
        print(json.dumps({"error": "HTML body (--html) is required"}), file=sys.stderr)
        sys.exit(1)

    try:
        creds = get_credentials()
        service = build("gmail", "v1", credentials=creds)

        message = build_message(to, subject, html_body, text_body)
        sent = service.users().messages().send(userId="me", body=message).execute()

        result = {
            "success": True,
            "message_id": sent.get("id"),
            "to": to,
            "subject": subject,
        }
        print(json.dumps(result, indent=2))

    except HttpError as e:
        print(json.dumps({"error": f"Gmail API error: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send an email via Gmail API.")
    parser.add_argument("--to", type=str, required=True, help="Recipient email address")
    parser.add_argument("--subject", type=str, required=True, help="Email subject line")
    parser.add_argument("--html", type=str, required=True, help="HTML body content")
    parser.add_argument("--text", type=str, default="", help="Plain text fallback body (optional)")
    args = parser.parse_args()

    send_email(args.to, args.subject, args.html, args.text)
