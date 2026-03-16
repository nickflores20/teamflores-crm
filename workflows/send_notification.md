# Workflow: Send Email Notification

## Objective
Send email notifications when key CRM events occur — primarily when a new lead arrives, but also for status changes when configured. All email is sent via Gmail using OAuth credentials stored in `.env`.

## Trigger Events
| Event | Notification Sent |
|---|---|
| New lead submitted | Always — immediate notification to Nick |
| Lead status → Closed | Optional — controlled by `NOTIFY_ON_CLOSE` in `.env` |
| Lead status → Lost | Optional — controlled by `NOTIFY_ON_LOST` in `.env` |
| Lead confirmation | Always — sent to the lead after form submission |

## Required Inputs
- `recipient` — Email address of the recipient
- `subject` — Email subject line
- `body_html` — HTML content of the email body
- `body_text` — Plain text fallback (required for accessibility and spam filters)

## Step-by-Step Flow

### Step 1 — Determine Notification Type
1. Check the triggering event against the list above.
2. For `NOTIFY_ON_CLOSE` and `NOTIFY_ON_LOST`, read the flag from `.env`. If the flag is `false` or not set, skip the email silently.
3. Compose the appropriate email content (see Templates section below).

### Step 2 — Authenticate with Gmail
1. The tool uses OAuth 2.0 with credentials stored in `credentials.json` and the refresh token in `token.json`.
2. If `token.json` is missing or expired, the tool will attempt to refresh using `GMAIL_REFRESH_TOKEN` from `.env`.
3. If authentication fails completely, log the error and surface it in the CRM dashboard as a banner alert.

### Step 3 — Send the Email
1. Call `tools/send_email.py` with:
   - `--to` → recipient email
   - `--subject` → subject line
   - `--html` → HTML body
   - `--text` → plain text body
2. The script sends via the Gmail API (`gmail.users.messages.send`).
3. A successful send returns a message ID. Log it in the Google Sheet's Notes column if applicable:
   - Format: `[EMAIL_SENT - 2026-03-16 14:32 - msg_id: xyz123]`

### Step 4 — Handle Failures
1. If send fails, wait 5 seconds and retry once.
2. If retry fails, log the failure:
   - In Google Sheets Notes: `[EMAIL_FAILED - 2026-03-16 14:32]`
   - In the CRM dashboard: show a red alert banner with the lead name and a "Retry" button.
3. Do not silently drop failed notifications.

## Email Templates

### New Lead Notification (to Nick)
```
Subject: New Lead: [Full Name] — [Service Interest]

Hi Nick,

A new lead just came in through the website.

Name: [Full Name]
Email: [Email]
Phone: [Phone]
Service: [Service Interest]
Source: [Source]
Submitted: [Timestamp]

Message:
[Message]

[View Lead in CRM →] (link to Google Sheet or CRM dashboard)

---
Team Flores CRM — automated notification
```

### Lead Confirmation (to the lead)
```
Subject: We received your inquiry — Team Flores

Hi [First Name],

Thank you for reaching out to Team Flores. We've received your inquiry
and will get back to you within 24 hours.

If you need immediate assistance, reply to this email or call us directly.

We look forward to connecting with you.

— The Team Flores Team
```

### Deal Closed Notification (to Nick, if enabled)
```
Subject: Deal Closed: [Full Name]

Nick,

[Full Name] has been marked as Closed. Great work.

View the full lead record here: [link]

---
Team Flores CRM
```

## Environment Variables Required
| Variable | Purpose |
|---|---|
| `GMAIL_SENDER` | The Gmail address used to send emails |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token for the sender account |
| `NICK_EMAIL` | Nick's email address for notifications |
| `NOTIFY_ON_CLOSE` | `true` / `false` — send notification on Closed status |
| `NOTIFY_ON_LOST` | `true` / `false` — send notification on Lost status |

## Expected Outputs
- Email delivered to recipient's inbox
- Message ID logged in Google Sheets if applicable
- CRM dashboard shows no error state

## Edge Cases
- **Invalid recipient email**: Validate format before calling the tool. Surface inline error.
- **Gmail API quota**: Gmail allows 500 messages/day for standard accounts. This CRM will not approach that limit under normal use. If it does, surface a quota warning.
- **HTML rendering issues**: Always include plain text fallback. Test templates in both Gmail and Outlook.
- **Lead's email bounces**: Currently not handled automatically. Nick should manually mark the lead as Lost and note the bounce.

## Tools Used
- `tools/send_email.py` — handles all email delivery via Gmail API
