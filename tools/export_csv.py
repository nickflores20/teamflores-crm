#!/usr/bin/env python3
"""
export_csv.py
Exports leads from Google Sheets to a CSV file.
Supports optional status filter and date range filter.

Usage:
    python tools/export_csv.py
    python tools/export_csv.py --status Qualified
    python tools/export_csv.py --date-from 2026-01-01 --date-to 2026-03-31
    python tools/export_csv.py --status New --date-from 2026-03-01 --output ./exports/march_new_leads.csv
"""

import os
import sys
import csv
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
SHEET_RANGE = os.getenv("SHEET_RANGE", "Leads!A1:K")
TOKEN_PATH = os.getenv("TOKEN_PATH", "token.json")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

VALID_STATUSES = ["New", "Contacted", "Qualified", "Closed", "Lost"]

CSV_HEADERS = [
    "ID", "Submitted At", "Full Name", "Email", "Phone",
    "Service Interest", "Message", "Source", "Status", "Notes", "Last Updated"
]

# Column indices (0-based) matching the sheet layout
COL_SUBMITTED_AT = 1
COL_STATUS = 8


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(f"No valid credentials. Ensure {TOKEN_PATH} exists.")
    return creds


def parse_date(date_str):
    """Parse YYYY-MM-DD string into a date object."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"Invalid date format '{date_str}'. Use YYYY-MM-DD.")


def row_matches_filters(row, status_filter, date_from, date_to):
    """Return True if the row passes all active filters."""
    # Pad short rows
    while len(row) < 11:
        row.append("")

    # Status filter
    if status_filter:
        row_status = row[COL_STATUS].strip()
        if row_status.lower() != status_filter.lower():
            return False

    # Date range filter on submitted_at (column index 1)
    if date_from or date_to:
        raw_date = row[COL_SUBMITTED_AT].strip()
        if not raw_date:
            return False
        try:
            # Accept ISO 8601 datetime or date-only
            row_date = datetime.fromisoformat(raw_date[:10]).date()
        except ValueError:
            return False
        if date_from and row_date < date_from:
            return False
        if date_to and row_date > date_to:
            return False

    return True


def export_to_csv(output_path, status_filter=None, date_from=None, date_to=None):
    if not SHEET_ID:
        print(json.dumps({"error": "SHEET_ID not set in .env"}), file=sys.stderr)
        sys.exit(1)

    try:
        creds = get_credentials()
        service = build("sheets", "v4", credentials=creds)

        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=SHEET_ID, range=SHEET_RANGE)
            .execute()
        )
        rows = result.get("values", [])

        if len(rows) <= 1:
            print(json.dumps({"warning": "No lead data found in sheet.", "count": 0}))
            return

        data_rows = rows[1:]  # Skip header

        # Apply filters
        filtered = [r for r in data_rows if row_matches_filters(r, status_filter, date_from, date_to)]

        if not filtered:
            print(json.dumps({"warning": "No leads match the selected filters.", "count": 0}))
            return

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
            writer.writerow(CSV_HEADERS)
            for row in filtered:
                # Pad and normalize newlines in Notes field (index 9)
                while len(row) < 11:
                    row.append("")
                row[9] = row[9].replace("\n", "\\n")
                writer.writerow(row[:11])

        result_obj = {
            "success": True,
            "count": len(filtered),
            "output": output_path,
            "filters": {
                "status": status_filter,
                "date_from": str(date_from) if date_from else None,
                "date_to": str(date_to) if date_to else None,
            },
        }
        print(json.dumps(result_obj, indent=2))

    except HttpError as e:
        print(json.dumps({"error": f"Google Sheets API error: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export leads from Google Sheets to CSV.")
    parser.add_argument("--status", type=str, default=None,
                        help=f"Filter by status. One of: {', '.join(VALID_STATUSES)}")
    parser.add_argument("--date-from", type=str, default=None,
                        dest="date_from", help="Start date filter (YYYY-MM-DD, inclusive)")
    parser.add_argument("--date-to", type=str, default=None,
                        dest="date_to", help="End date filter (YYYY-MM-DD, inclusive)")
    parser.add_argument("--output", type=str, default=None,
                        help="Output CSV file path (default: ./exports/leads_TIMESTAMP.csv)")
    args = parser.parse_args()

    # Validate status
    if args.status and args.status not in VALID_STATUSES:
        print(json.dumps({"error": f"Invalid status '{args.status}'. Options: {', '.join(VALID_STATUSES)}"}),
              file=sys.stderr)
        sys.exit(1)

    # Parse dates
    date_from = parse_date(args.date_from) if args.date_from else None
    date_to = parse_date(args.date_to) if args.date_to else None

    # Default output path
    if not args.output:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        args.output = f"./exports/leads_{timestamp}.csv"

    export_to_csv(args.output, args.status, date_from, date_to)
