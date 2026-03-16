# Workflow: Export Lead Data to CSV

## Objective
Export leads from Google Sheets to a downloadable CSV file. Supports full exports, status-filtered exports, and date-range exports.

## Trigger
Nick clicks the "Export" button in the CRM dashboard and selects export options.

## Export Modes
| Mode | Description |
|---|---|
| Full export | All leads, all columns, no filters |
| Status filter | Only leads matching a specific status (e.g., `Qualified`) |
| Date range | Only leads submitted between a start and end date |
| Combined | Status filter + date range together |

## Required Inputs
- `--output` — File path for the output CSV (default: `./exports/leads_[timestamp].csv`)
- `--status` — (optional) Filter by status value
- `--date-from` — (optional) Start date in `YYYY-MM-DD` format
- `--date-to` — (optional) End date in `YYYY-MM-DD` format

## Step-by-Step Flow

### Step 1 — Nick Configures the Export
1. Nick clicks the "Export CSV" button in the CRM dashboard (top-right of Leads page).
2. An export options panel slides open with:
   - Status dropdown (All, New, Contacted, Qualified, Closed, Lost)
   - Date From picker
   - Date To picker
3. Nick selects options and clicks "Download".

### Step 2 — Fetch and Filter Data
1. Call `tools/export_csv.py` with the selected options.
2. The script fetches all rows from Google Sheets via the Sheets API.
3. Filters are applied in this order:
   a. Status filter (if provided)
   b. Date range filter on the `submitted_at` column (inclusive on both ends)
4. If no filters are provided, all rows are included.

### Step 3 — Build the CSV
1. CSV headers are written first:
   ```
   ID,Submitted At,Full Name,Email,Phone,Service Interest,Message,Source,Status,Notes,Last Updated
   ```
2. Each matching lead row is written in the same column order.
3. Text fields containing commas or newlines are wrapped in double quotes.
4. Notes field newlines are escaped as `\n` in the CSV to prevent row breaks.

### Step 4 — Deliver the File
1. The CSV is saved to `./exports/leads_[YYYYMMDD_HHMMSS].csv`.
2. The browser triggers a file download automatically.
3. A success toast shows: "Exported [N] leads to CSV."
4. If 0 leads match the filter, show a warning: "No leads match the selected filters." Do not generate an empty file.

## Expected Outputs
- A valid, UTF-8 encoded CSV file downloaded to Nick's machine
- Filename includes a timestamp to prevent overwriting previous exports
- Toast notification confirms count of exported rows

## Edge Cases
- **Date format errors**: If date inputs are malformed, surface an inline error before running the export.
- **Large exports (1000+ rows)**: Show a loading spinner. Do not block the UI.
- **Google Sheets API failure**: Show error message: "Export failed — could not read from Google Sheets." Provide a retry button.
- **Special characters in fields**: Ensure proper CSV quoting. Test with names containing commas (e.g., "Smith, Jr.").

## Output File Location
- Exports are written to `./exports/` directory (created automatically if it doesn't exist)
- Files are never overwritten — timestamps ensure unique filenames
- Files are gitignored and not committed to the repo

## Tools Used
- `tools/export_csv.py` — fetches, filters, and writes the CSV file
