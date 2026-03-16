#!/usr/bin/env python3
"""
update_status.py
Updates a specific lead's status and notes in Google Sheets.
Notes are PREPENDED with a timestamp — never overwritten.

Usage:
    python tools/update_status.py --row 5 --status Contacted --notes "Left voicemail at 2pm"
    python tools/update_status.py --row 12 --status Closed
"""

import os
import sys
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = os.getenv("SHEET_NAME", "Leads")
TOKEN_PATH = os.getenv("TOKEN_PATH", "token.json")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

VALID_STATUSES = ["New", "Contacted", "Qualified", "Closed", "Lost"]

# Column positions (1-based, matching Google Sheets column letters)
COL_STATUS = "H"      # Column 8
COL_NOTES = "I"       # Column 9
COL_LAST_UPDATED = "J"  # Column 10


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(f"No valid credentials. Ensure {TOKEN_PATH} exists and is valid.")
    return creds


def get_existing_notes(service, row_number):
    """Fetch the current notes for a row before prepending new notes."""
    range_str = f"{SHEET_NAME}!{COL_NOTES}{row_number}"
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=range_str)
        .execute()
    )
    values = result.get("values", [])
    if values and values[0]:
        return values[0][0]
    return ""


def update_lead(row_number, new_status, new_notes):
    if not SHEET_ID:
        print(json.dumps({"error": "SHEET_ID not set in .env"}), file=sys.stderr)
        sys.exit(1)

    if new_status not in VALID_STATUSES:
        print(
            json.dumps({"error": f"Invalid status '{new_status}'. Must be one of: {', '.join(VALID_STATUSES)}"}),
            file=sys.stderr,
        )
        sys.exit(1)

    if row_number <= 1:
        print(json.dumps({"error": "row_number must be >= 2 (row 1 is the header)"}), file=sys.stderr)
        sys.exit(1)

    try:
        creds = get_credentials()
        service = build("sheets", "v4", credentials=creds)

        now = datetime.now().strftime("%Y-%m-%d %H:%M")

        # Build updated notes string
        if new_notes:
            existing_notes = get_existing_notes(service, row_number)
            if existing_notes:
                combined_notes = f"[{now}] {new_notes}\n{existing_notes}"
            else:
                combined_notes = f"[{now}] {new_notes}"
        else:
            combined_notes = get_existing_notes(service, row_number)

        # Write status, notes, and last_updated in a single batchUpdate
        data = [
            {
                "range": f"{SHEET_NAME}!{COL_STATUS}{row_number}",
                "values": [[new_status]],
            },
            {
                "range": f"{SHEET_NAME}!{COL_NOTES}{row_number}",
                "values": [[combined_notes]],
            },
            {
                "range": f"{SHEET_NAME}!{COL_LAST_UPDATED}{row_number}",
                "values": [[now]],
            },
        ]

        body = {"valueInputOption": "RAW", "data": data}
        service.spreadsheets().values().batchUpdate(
            spreadsheetId=SHEET_ID, body=body
        ).execute()

        result = {
            "success": True,
            "row": row_number,
            "status": new_status,
            "notes": combined_notes,
            "last_updated": now,
        }
        print(json.dumps(result, indent=2))

    except HttpError as e:
        print(json.dumps({"error": f"Google Sheets API error: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update lead status and notes in Google Sheets.")
    parser.add_argument("--row", type=int, required=True, help="Row number in the sheet (2 or higher)")
    parser.add_argument("--status", type=str, required=True, help=f"New status. One of: {', '.join(VALID_STATUSES)}")
    parser.add_argument("--notes", type=str, default="", help="Notes to prepend (optional)")
    args = parser.parse_args()

    update_lead(args.row, args.status, args.notes)
