# Workflow: Update Lead Status

## Objective
Allow Nick to update the status of any lead in the CRM, add notes, and have those changes reflected in Google Sheets in real time.

## Trigger
Nick selects a lead in the CRM dashboard and changes its status or adds a note.

## Valid Status Values
| Status | Meaning |
|---|---|
| `New` | Just came in, no contact made yet |
| `Contacted` | Nick has reached out at least once |
| `Qualified` | Lead confirmed interest and fits the service profile |
| `Closed` | Deal won — client signed or booked |
| `Lost` | Lead went cold, chose a competitor, or is not a fit |

## Required Inputs
- `row_number` — The row in Google Sheets that corresponds to this lead
- `new_status` — One of the five valid status values above
- `notes` — Any text Nick adds (appended, not replaced — see Step 2)

## Step-by-Step Flow

### Step 1 — Nick Initiates the Update
1. Nick opens the CRM dashboard and clicks on a lead row.
2. The Lead Modal opens showing all current lead details.
3. Nick selects the new status from the dropdown.
4. Nick types any notes in the Notes field.
5. Nick clicks "Save".

### Step 2 — Validate the Update
1. Confirm `new_status` is one of the five valid values. Reject anything else.
2. Confirm `row_number` maps to a real row (not header row 1, not beyond the last row).
3. Notes are appended to existing notes with a timestamp prefix:
   - Format: `[2026-03-16 14:32] Contacted via phone — left voicemail.\n[previous notes...]`
   - Never overwrite old notes — always prepend new notes.

### Step 3 — Write to Google Sheets
1. Call `tools/update_status.py` with:
   - `--row` → row number
   - `--status` → new status value
   - `--notes` → full updated notes string (new note prepended to existing)
2. The script updates:
   - Column H (Status) → new status
   - Column I (Notes) → updated notes string
   - Column J (Last Updated) → current timestamp
3. If write fails, surface error in the modal: "Save failed — please try again." Do not close the modal.

### Step 4 — Refresh the CRM Table
1. After a successful save, close the modal.
2. Re-fetch leads from Google Sheets via `tools/fetch_leads.py`.
3. Re-render the Leads table with updated data.
4. The updated lead row should be visually highlighted briefly (green flash) to confirm the save.

### Step 5 — Status-Triggered Actions (Conditional)
- If status changes to `Closed`:
  - Log the close date in Notes automatically.
  - Optionally trigger a "Win" notification (if `NOTIFY_ON_CLOSE=true` in `.env`).
- If status changes to `Lost`:
  - Log the loss date in Notes automatically.
- No email is sent for `Contacted` or `Qualified` status changes unless configured.

## Expected Outputs
- Google Sheets row updated with new status, appended notes, and fresh timestamp
- CRM table refreshes showing updated data
- Lead modal closes cleanly after successful save

## Edge Cases
- **Concurrent edits**: If two tabs have the CRM open, last write wins. No conflict resolution currently implemented — note this as a known limitation.
- **Empty notes field**: Allowed. Do not prepend a blank timestamped entry.
- **Status unchanged, only notes added**: This is valid — write notes and update the Last Updated column even if status is the same.
- **Network failure mid-write**: Retry once automatically. If still failing, keep modal open and show error.

## Tools Used
- `tools/update_status.py` — writes the status and notes update to Google Sheets
- `tools/fetch_leads.py` — re-fetches all leads after update to refresh the table
