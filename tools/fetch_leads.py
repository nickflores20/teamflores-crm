#!/usr/bin/env python3
"""
fetch_leads.py
Reads all leads from Google Sheets and returns them as JSON.
Reads SHEET_ID and credentials from .env.

Usage:
    python tools/fetch_leads.py
    python tools/fetch_leads.py --pretty
"""

import os
import sys
import json
import argparse
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

SHEET_ID = os.getenv("SHEET_ID")
SHEET_RANGE = os.getenv("SHEET_RANGE", "Leads!A1:K")
TOKEN_PATH = os.getenv("TOKEN_PATH", "token.json")
CREDENTIALS_PATH = os.getenv("CREDENTIALS_PATH", "credentials.json")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

COLUMN_MAP = [
    "id",
    "submitted_at",
    "full_name",
    "email",
    "phone",
    "service_interest",
    "message",
    "source",
    "status",
    "notes",
    "last_updated",
]


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(
                f"No valid credentials found. Run the auth flow and save to {TOKEN_PATH}."
            )
    return creds


def fetch_leads(pretty=False):
    if not SHEET_ID:
        print(json.dumps({"error": "SHEET_ID not set in .env"}), file=sys.stderr)
        sys.exit(1)

    try:
        creds = get_credentials()
        service = build("sheets", "v4", credentials=creds)
        sheet = service.spreadsheets()

        result = (
            sheet.values()
            .get(spreadsheetId=SHEET_ID, range=SHEET_RANGE)
            .execute()
        )
        rows = result.get("values", [])

        if not rows:
            output = {"leads": [], "count": 0}
            print(json.dumps(output, indent=2 if pretty else None))
            return

        # Skip header row (row index 0), data starts at row 1
        data_rows = rows[1:]
        leads = []

        for i, row in enumerate(data_rows):
            lead = {}
            for j, col in enumerate(COLUMN_MAP):
                lead[col] = row[j] if j < len(row) else ""
            lead["row_number"] = i + 2  # +2 because of header row and 1-based index
            leads.append(lead)

        output = {"leads": leads, "count": len(leads)}
        print(json.dumps(output, indent=2 if pretty else None))

    except HttpError as e:
        print(json.dumps({"error": f"Google Sheets API error: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch all leads from Google Sheets.")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    args = parser.parse_args()
    fetch_leads(pretty=args.pretty)
