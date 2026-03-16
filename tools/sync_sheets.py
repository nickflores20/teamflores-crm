#!/usr/bin/env python3
"""
sync_sheets.py
Syncs the CRM dashboard summary data with a dedicated Summary tab in Google Sheets.
Computes lead counts by status and writes them to the Summary sheet.
Can be run on a schedule (cron) or on demand.

Usage:
    python tools/sync_sheets.py
    python tools/sync_sheets.py --summary-sheet "Summary"
    python tools/sync_sheets.py --dry-run
"""

import os
import sys
import json
import argparse
from datetime import datetime
from collections import Counter
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

SHEET_ID = os.getenv("SHEET_ID")
LEADS_RANGE = os.getenv("SHEET_RANGE", "Leads!A1:K")
TOKEN_PATH = os.getenv("TOKEN_PATH", "token.json")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

VALID_STATUSES = ["New", "Contacted", "Qualified", "Closed", "Lost"]
COL_STATUS = 8  # 0-based column index for Status


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(f"No valid credentials at {TOKEN_PATH}.")
    return creds


def fetch_all_rows(service):
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=LEADS_RANGE)
        .execute()
    )
    rows = result.get("values", [])
    return rows[1:] if len(rows) > 1 else []  # Skip header


def compute_summary(data_rows):
    """Compute lead counts by status and total."""
    counts = Counter()
    for row in data_rows:
        status = row[COL_STATUS].strip() if len(row) > COL_STATUS else "Unknown"
        counts[status] += 1

    summary = {
        "total": len(data_rows),
        "by_status": {s: counts.get(s, 0) for s in VALID_STATUSES},
        "synced_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    return summary


def write_summary_to_sheet(service, summary, summary_sheet):
    """Write the summary data to the Summary tab."""
    now = summary["synced_at"]

    rows = [
        ["Team Flores CRM — Summary", ""],
        ["Last Synced", now],
        ["", ""],
        ["Status", "Count"],
    ]
    for status in VALID_STATUSES:
        rows.append([status, summary["by_status"][status]])
    rows.append(["", ""])
    rows.append(["Total Leads", summary["total"]])

    range_str = f"{summary_sheet}!A1"
    body = {"values": rows}

    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=range_str,
        valueInputOption="RAW",
        body=body,
    ).execute()


def sync(summary_sheet="Summary", dry_run=False):
    if not SHEET_ID:
        print(json.dumps({"error": "SHEET_ID not set in .env"}), file=sys.stderr)
        sys.exit(1)

    try:
        creds = get_credentials()
        service = build("sheets", "v4", credentials=creds)

        data_rows = fetch_all_rows(service)
        summary = compute_summary(data_rows)

        if dry_run:
            print(json.dumps({"dry_run": True, "summary": summary}, indent=2))
            return

        write_summary_to_sheet(service, summary, summary_sheet)

        result = {
            "success": True,
            "summary": summary,
            "written_to": f"{summary_sheet} tab in sheet {SHEET_ID}",
        }
        print(json.dumps(result, indent=2))

    except HttpError as e:
        print(json.dumps({"error": f"Google Sheets API error: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync CRM summary data to Google Sheets.")
    parser.add_argument("--summary-sheet", type=str, default="Summary",
                        help="Name of the summary tab in the Google Sheet (default: Summary)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Compute summary without writing to the sheet")
    args = parser.parse_args()

    sync(args.summary_sheet, args.dry_run)
