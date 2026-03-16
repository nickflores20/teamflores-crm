# Workflow: New Lead Capture

## Objective
Capture a lead submitted via the website contact/quote form, log it to Google Sheets, and notify Nick so he can follow up immediately.

## Trigger
A visitor submits the lead form on the Team Flores website.

## Required Inputs
- `full_name` — Lead's full name
- `email` — Lead's email address
- `phone` — Lead's phone number (optional but preferred)
- `service_interest` — What service they're inquiring about
- `message` — Their inquiry or notes
- `source` — Where the lead came from (form field or UTM param)
- `submitted_at` — Timestamp of submission (ISO 8601)

## Step-by-Step Flow

### Step 1 — Form Submission
1. Lead fills out the form on the website and hits Submit.
2. The form POSTs to the backend endpoint (or webhook — see `.env` for `FORM_WEBHOOK_URL`).
3. The submission is validated: name and email are required. If missing, the form returns an error to the user.

### Step 2 — Write Lead to Google Sheets
1. The agent reads this workflow and calls `tools/fetch_leads.py` to get the current last row number.
2. The agent then appends a new row to the Google Sheet (`SHEET_ID` from `.env`) with:
   - Column A: Timestamp (auto-set to submission time)
   - Column B: Full Name
   - Column C: Email
   - Column D: Phone
   - Column E: Service Interest
   - Column F: Message
   - Column G: Source
   - Column H: Status → set to `New`
   - Column I: Notes → blank
   - Column J: Last Updated → same as timestamp
3. If the write fails, log the error and retry once. If it fails again, fall back to emailing the raw data to Nick directly.

### Step 3 — Send Notification Email to Nick
1. Call `tools/send_email.py` with:
   - `recipient`: Nick's email from `.env` (`NICK_EMAIL`)
   - `subject`: `New Lead: [Full Name] — [Service Interest]`
   - `body`: HTML email containing all lead fields, a direct link to the Google Sheet, and a call-to-action button "View in CRM"
2. If email send fails, log the error and surface it as an alert in the CRM dashboard.

### Step 4 — Confirm to the Lead
1. Send a confirmation email to the lead's address:
   - Subject: `We received your inquiry — Team Flores`
   - Body: Thank them, set expectation of response within 24 hours, include contact info.
2. This email is informational only. No action required from the lead.

## Expected Outputs
- New row appended to Google Sheets with status `New`
- Notification email delivered to Nick
- Confirmation email delivered to the lead
- CRM dashboard shows the new lead at the top of the table

## Edge Cases
- **Duplicate email**: Check if the email already exists in the sheet. If found, flag as possible duplicate in the Notes column but still add the row.
- **Missing phone**: Leave phone cell blank — do not error.
- **Google Sheets API rate limit**: Wait 2 seconds and retry. Max 3 retries.
- **Email delivery failure**: Log in sheet Notes column: `[EMAIL_FAILED - timestamp]`. Alert Nick via fallback method if configured.

## Tools Used
- `tools/fetch_leads.py` — to check current row count / check for duplicates
- `tools/send_email.py` — to notify Nick and confirm to the lead
