# Follow Up Boss (FUB) — Complete Design Spec

Compiled from direct inspection of followupboss.com marketing pages and extracted CRM application screenshots.

---

## 1. BRAND IDENTITY & COLOR SYSTEM

### Logo
- Stacked chevron/arrow mark in three colors: red (#E8453C or similar warm red), yellow/gold (#F5A623 approx), and blue (teal-ish, ~#29B6D1)
- Wordmark: "follow up boss" in all-lowercase, dark charcoal, clean sans-serif
- The three-layer chevron is the primary brand icon used as app favicon and nav brand mark

### Complete Color Palette

| Token | Hex | Usage |
|---|---|---|
| Brand Primary Dark | `#161616` | Buttons, top nav background, modal headers, panel titles |
| Brand Text | `#111116` | Body text, headings |
| White | `#FFFFFF` | Page backgrounds, card surfaces, modal content areas |
| Accent Blue (links) | `#0041D9` | Hyperlinks, active tab underlines |
| Focus Blue | `#4D65FF` | Keyboard focus ring |
| Border Gray | `#CDCDD3` | Card borders, table dividers, input borders |
| Light Background | `#F2F1EC` | Page content area background (off-white/cream), sub-panel backgrounds |
| Light Gray (content bg) | `#F5F5F5` approx | Table/list container background, slight variation on above |
| Action Blue | `#29B6D1` or `#4DB8D4` | Call/phone icon circles, active tab underline on People tab, SMS icon circle |
| Status Blue (RUNNING) | `#4CBDD9` (cyan-teal) | "Running" action plan badge |
| Status Red (PAUSED) | `#E8453C` or `#E84545` | "Paused" action plan badge, hang-up button, brand red chevron |
| Status Yellow/Gold | `#F5A623` or `#F0A500` | "Completed" action plan badge, chart lines, leaderboard dollar values, brand gold chevron |
| Email Icon Teal | `#1A9BD7` approx | Email icon circle in top nav |
| Notification Yellow | `#F5A623` | Notification bell badge |
| Chart Line Blue | `#5AB4D6` (light blue) | Chart line 1 (New Leads) |
| Chart Line Yellow | `#F0A500` (amber) | Chart line 2 (Avg Speed to Action), area fill is pale yellow `#FEF9E7` |
| Badge Pricing Blue | `#CFE9F6` | "Most Popular" badge on pricing |
| Badge Pricing Yellow | `#FFF4DE` | Pricing ribbon accent |
| Badge Pricing Red | `#FFD6D7` | Pricing ribbon accent |

### Brand Accent Shapes (Marketing Site)
- Red quarter-circle shape used as decorative background element (coral-red, ~`#E84545`)
- Blue triangle/wedge shape (~`#29B6D1`)
- These appear as background decorations in feature sections, not in the app UI itself

---

## 2. TYPOGRAPHY

### Font Families
- **Headings / Display**: `"Object Sans"` — a geometric sans-serif with very bold weights
  - Fallbacks: `"Adjusted Arial"`, `Tahoma`, `Geneva`, `sans-serif`
- **Body / UI**: `Inter` — clean neutral sans-serif
  - Fallbacks: `"Adjusted Arial"`, `Tahoma`, `Geneva`, `sans-serif`
- **Font Smoothing**: `-webkit-font-smoothing: antialiased` applied globally

### Marketing Site Type Scale
| Element | Font | Size | Weight | Line-height |
|---|---|---|---|---|
| Section Headings (h2) | Object Sans | fluid, large | 900 | tight |
| Card Titles (h3) | Object Sans | 20px | 900 | 24px |
| Body copy | Inter | 14px | 400 | 20px |
| Category labels | Inter | 14px | 600 | 20px |
| Button text | Inter | 14px | 700 | 20px |
| Link text | Inter | 14px | 400 | 20px |
| Nav items | Inter | 14px | 400–600 | 20px |

### App UI Type (from screenshots)
| Element | Appearance |
|---|---|
| Top nav items (People, Inbox, Tasks…) | Inter or similar, ~13–14px, medium weight, light color on dark bg |
| Page title ("Phone Number Management") | ~18–20px, weight 500–600, dark charcoal |
| Table column headers (Name, Source, Agent…) | ~12–13px, weight 500, medium gray `#888` or `#999` |
| Table row — primary name | ~14px, weight 500–600, dark `#222` |
| Table row — secondary/subtitle | ~12px, weight 400, medium gray `#777` |
| Smart List tab labels | ~14–15px, weight 400 (inactive), weight 700 (active) |
| Count badges in tabs | same size as label, lighter gray when inactive |
| Section headers (e.g. "Showing all 4 people") | ~13px, weight 400, medium gray |
| Modal title (e.g. "Lead Details", "Action Plan") | ~15–16px, weight 600, white on dark header |
| Action Plan row labels | ~14px, weight 400, medium charcoal |
| Action Plan status badge text | ~11–12px, weight 700, uppercase, white |

---

## 3. LAYOUT STRUCTURE

### Marketing Site
- **Max content width**: ~1230px, centered with `margin: 0 auto`
- **Container classes**: `.container-small`, `.container-medium`, `.container-large`
- **Breakpoints**: 479px (mobile), 767px (mobile landscape), 991px (tablet), 1440px, 1920px
- **Hero sections**: Full-width with centered text, SVG decorative elements flanking headlines
- **Feature sections**: Alternating image-left/text-right and text-left/image-right layouts
- **Footer**: Multi-column link grid

### CRM Application (from screenshots)

#### Top Navigation Bar
- **Background**: Very dark charcoal/near-black — approximately `#2D3748` or `#1F2937` (appears as a deep gray-navy, slightly warmer than pure black; in the smart list screenshot it reads as `#2C3A47` range)
- **Height**: approximately 48–56px
- **Logo**: Stacked chevron icon (red/yellow/blue), left-aligned
- **Nav items**: People, Inbox, Tasks, Calendar, Deals, Reporting, Admin — with icon + text label
  - **Active item**: text appears white/bright, small downward triangle indicator below active item
  - **Inactive items**: muted gray-white, icon opacity reduced
- **Right side**: Action icons — Phone (blue circle), SMS/Chat (blue circle), Email (teal circle), Notifications (bell with yellow badge), User avatar with dropdown
- **Icon circles**: ~32px diameter, colored circles (blue for phone/SMS, teal for email)

#### Sub-navigation (Admin page example)
- Second row below top nav, white background
- Items: Lead Flow, Groups, Teams, Action Plans, Automations, Ponds, Email Templates, Text Templates, Import, Phone Numbers, Tags, Integrations, More
- Active item has blue underline (`#0041D9` or similar)
- Items are ~13px, gray, separated by spacing (not pipes)

#### People/Smart List Page Layout
- **Page background**: Light off-white/gray `#F2F1EC` or `#F5F5F5`
- **Tab row** (All People, New Leads, Hot, Warm, Cold, Past Clients, Referrals…):
  - White or very light background
  - Active tab: bold text, blue underline ~2–3px
  - Inactive tabs: normal weight, dark text with count in parentheses (lighter gray)
  - Tab height: ~48px
- **Toolbar row** ("Showing all 4 people" + action icons):
  - Background: same light gray as page
  - Icon buttons: outlined square buttons ~36px, containing icons (email, phone, person+, tag, trash, export)
  - These are light gray bordered squares with gray icons
- **Table container**: White card with subtle border or shadow, rounded corners ~8px
  - Padding: ~16px or 0 (table goes edge-to-edge within the card)
  - Box shadow: very subtle, low opacity

#### Lead Table Design
- **Header row**: Column headers (Name, Source, Agent, Phone, Email)
  - Text: ~12–13px, weight 500, gray ~`#9CA3AF`
  - Checkbox column left
  - Background: white, separated from data rows by a thin line
- **Data rows**:
  - Height: approximately 64–72px (accommodates avatar + 2 lines of text)
  - Background: white
  - Divider: 1px solid light gray between rows (~`#E5E7EB` or `#EBEBEB`)
  - No alternating row colors — all white
  - Left: checkbox (16px square, rounded) + avatar (circular, ~36–40px diameter)
  - Name column: primary name in dark charcoal (~14px, weight 600) + subtitle in gray (~12px, weight 400) on second line
  - Source column: plain text, ~14px, medium gray
  - Agent column: small circular avatar (24px) + agent name text
  - Phone column: phone/SMS icon circles (green ~20px for call, blue ~20px for SMS) + number text
  - Email column: email icon + address text
- **No alternating row background colors** — clean all-white rows
- **Hover state**: Not visible in screenshots but likely a subtle `#F9FAFB` highlight

#### Lead Details Panel / Modal
- **Header**: Full-width dark bar (~`#161616` or `#1A1A2E`), ~48px tall
  - White title text ("Lead Details"), close X button right-aligned
- **Body**: White background
- **Contact header area**: Circular avatar (~48px), name in dark charcoal, value in gold/amber (`#F5A623` — "$1M" example)
- **Tab row** (Info, Comms, Notes, Tasks, Plans):
  - Active: "Comms" shown in blue (`#0041D9`), underlined
  - Inactive: dark gray text
  - ~14px, weight 500
- **Communication timeline items**: Each item has small circular icon (blue/gray chat bubble), sender info, timestamp, preview text
- **Panel width**: approximately 320–380px overlay

---

## 4. COMPONENT STYLES

### Buttons

#### Primary Button (Dark/Black)
```
background: #161616
color: #FFFFFF
border: none
border-radius: 12px
height: 44px
padding: 10px 16px
font-size: 14px
font-weight: 700
transition: background-color 0.2s, color 0.2s
cursor: pointer
```
Hover state: `background: #FFFFFF; color: #161616; border: 1px solid #161616`

#### Primary Button (Blue — in app)
```
background: #0041D9 or #29B6D1 (teal-blue)
color: #FFFFFF
border-radius: 20px (pill shape — "New Port Request" button)
height: ~36–40px
padding: 8px 20px
font-size: 13–14px
font-weight: 600
```
Example: "New Port Request" button is a teal-blue pill shape

#### Action Plan Status Badges (pill buttons with dropdown)
```
/* RUNNING */
background: #4CBDD9 (cyan-teal)
color: #FFFFFF
border-radius: 20px
padding: 6px 14px
font-size: 11–12px
font-weight: 700
text-transform: uppercase
icon: play triangle (▶) left of text

/* PAUSED */
background: #E84545 (red)
color: #FFFFFF
border-radius: 20px
same padding/font
icon: pause bars (⏸) left of text

/* COMPLETED */
background: #F5A623 (amber/gold)
color: #FFFFFF
border-radius: 20px
same padding/font
icon: checkmark (✓) left of text
```
All three have a small dropdown arrow (chevron ▾) on the right side, indicating they are interactive dropdowns.

#### Icon Action Buttons (Toolbar)
```
background: white
border: 1px solid #CDCDD3 or #E2E8F0
border-radius: 6px
width: ~36px
height: ~36px
display: flex; align-items: center; justify-content: center
color: #9CA3AF (gray icons)
```

#### Ghost/Text Buttons
- "Hide completed" link — plain text, no border, ~13px, gray, underline on hover
- "Actions ▾" in tables — text + chevron, no background, gray color

### Cards

#### Deals Pipeline Card
```
background: #FFFFFF
border: none (sits within column)
border-radius: 8px
padding: 12–16px
margin-bottom: 8px
box-shadow: 0 1px 3px rgba(0,0,0,0.08)
```
Content: 2 lines of blurred text (name/address) + circular avatar(s) at bottom

#### Pipeline Column
```
background: #F0F0F0 (light gray)
border-radius: 8px
padding: 12px
width: ~240–280px
```
Column header: plain text label (Buyer Contract, Offer, Pending, Closed), bold ~16px
Colored top accent bar: 4–6px thick, full column width, rounded top
- Buyer Contract: `#F5A623` (gold/amber)
- Offer: `#29B6D1` (teal-blue)
- Pending: `#E84545` (red)
- Closed: `#9CA3AF` (gray)

#### Metric/KPI Cards (Reporting)
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
padding: 16px
```
Content layout:
- Label text: ~12px, gray `#9CA3AF`, weight 400
- Value: ~24–28px, weight 700, dark charcoal
- Trend: ~12px, with up arrow ↑, gray
- Mini sparkline chart at bottom right

#### AI Call Summary Card
```
background: #FFFFFF
border-radius: 12px
border-left: 4px solid #F5A623 (amber) — implied by phone icon color
padding: 16px
```
Header: green phone icon circle + contact name + duration
Tabs: "Summary" | "Transcript" — Summary active with underline
Content: bulleted summary list, "Suggested Tasks" section

### Tables (Admin/Settings)

#### Table Container
```
background: #FFFFFF
border: 1px solid #E2E8F0
border-radius: 8px
overflow: hidden
```

#### Table Rows
```
border-bottom: 1px solid #F1F5F9
padding: 12px 16px
```
No alternating colors. Light gray dividers only.

Column layout (Phone Number Management example):
- Col 1: Label text (e.g., "Main Inbox") — ~14px, dark charcoal, weight 400
- Col 2: Phone number with phone icon — gray icon + number text
- Col 3: "Actions ▾" dropdown link — muted blue/teal, weight 500

Section headers ("Company", "Team Inboxes"):
- Plain text, ~16px, weight 600, dark charcoal
- Margin below before table container

### Forms & Inputs

#### Dropdowns (Action Plan editor)
```
background: #F0F0F0 or #E5E5E5
border: 1px solid #CDCDD3
border-radius: 4–6px
padding: 6px 12px
font-size: 14px
chevron: ▾ right-aligned
```

#### Checkboxes
```
width: 16px; height: 16px
border: 1px solid #CDCDD3
border-radius: 3px
background when unchecked: #FFFFFF
```

#### Toggle/Switch
```
background when off: #F2F1EC (light cream)
background when on: #0041D9 or teal
border-radius: 999px (pill)
width: ~36px; height: ~20px
```

### Avatars & Initials

#### Photo Avatars
```
border-radius: 50% (circular)
sizes: 24px (table agent), 36–40px (table contact), 48px (lead detail), 80px (leaderboard)
border: 2px solid white (for stacked avatars)
```

#### Initial Avatars
```
border-radius: 50%
background: #9CA3AF (medium gray)
color: #FFFFFF
font-size: 11–12px
font-weight: 600
text-transform: uppercase
width/height: 32px (small), 40px (medium)
```
Example: "JL" for Jean Luc, "AG" for Agent Green, "WR" for William Riker

### Status/Tag Pills (Pricing & Feature Lists)

#### Pricing Plan Badge Triangle
```
/* CSS triangle pointer above card */
border-style: solid
border-color: #CFE9F6 transparent  /* blue variant */
border-width: 0 25px 20px
position: absolute
top: -20px
```

### Communication Timeline (Inbox/Comms)

Thread list layout:
- Each item: left icon (small circular chat bubble ~24px, gray/slate), sender → recipient arrow format, date/time right-aligned
- Message preview: 1–2 lines of text, ~14px, dark charcoal
- Timestamp: ~12px, gray
- Items separated by no border — just spacing
- Thread background: white
- Font: Inter, ~14px

SMS Chat bubbles (mobile overlay):
- Outbound (agent): Blue bubble `#0041D9` or similar, right-aligned, white text
- Inbound (lead): Light gray bubble `#E5E7EB`, left-aligned, dark text
- Border-radius: ~18px (rounded pill bubbles)

---

## 5. NAVIGATION — TOP BAR (App)

```
background: #2C3A47 or #1F2B38 (dark blue-gray/charcoal)
  — appears as a very dark navy-charcoal, NOT pure black
height: ~52px
padding: 0 16px
display: flex; align-items: center; gap: 24–32px
```

### Nav Items
```
color: rgba(255,255,255,0.65)  /* inactive */
color: #FFFFFF  /* active */
font-size: 13–14px
font-weight: 500
display: flex; align-items: center; gap: 6px
```
Active state: slightly brighter/white text + small downward white triangle caret below item

### Nav Icons (left of text labels)
- Each nav item has a small icon (~16px): person silhouette, inbox tray, checklist, calendar grid, price tag/deal, bar chart, wrench
- Color matches text (muted white when inactive)

### Right-side Action Icons
```
/* Icon circles */
width: 32px; height: 32px
border-radius: 50%
display: flex; align-items: center; justify-content: center

/* Phone icon */
background: #22C55E or #16A34A (green)  /* from AI call summary card */
/* or */ background: #29B6D1 (teal-blue)

/* SMS/Chat icon */
background: #29B6D1 (teal-blue / cyan)

/* Email icon */
background: #1A9BD7 (medium blue)

/* Notification bell */
background: transparent
color: white
badge: #F5A623 (gold) small dot/number
```

### User Avatar
- Circular photo, ~32px
- Small dropdown chevron ▾ to the right

---

## 6. DEALS / PIPELINE VIEW

**Layout**: Horizontal kanban columns, scrollable horizontally
**Page header**: "My Deals" — white text on dark (`#161616`) banner, full width, ~48px tall

**Column structure**:
```
width: ~240px
min-height: 600px
background: #F5F5F5 (light gray)
border-radius: 8px
padding: 12px
margin-right: 12px
```

**Column top accent strip**:
```
height: 6px
width: 100%
border-radius: 4px 4px 0 0
margin-bottom: 12px
```
Colors per stage:
- Buyer Contract: `#F5A623` (gold)
- Offer: `#29B6D1` (teal/sky blue)
- Pending: `#E84545` (red)
- Closed: `#BBBBBBB` (gray, neutral)

**Column title**: ~16px, weight 700, dark charcoal `#1A1A2E`

**Deal cards**:
```
background: #FFFFFF
border-radius: 8px
padding: 12px 14px
margin-bottom: 8px
box-shadow: 0 1px 2px rgba(0,0,0,0.06)
```
Card content:
- Two text placeholder lines (primary ~14px dark, secondary ~12px gray)
- Bottom-left: 1–2 circular avatars (36px, stacked with slight overlap)

---

## 7. REPORTING / ANALYTICS VIEW

**Page header**: Dark bar "Show me [how quickly we follow up on leads ▾]" — interactive filter

**Chart area**:
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
padding: 20px
```

**Metric filter pills** (above chart):
```
/* e.g. "● NEW LEADS ▾" */
border: 1px solid #CDCDD3
border-radius: 999px (full pill)
padding: 8px 16px
background: #FFFFFF
font-size: 12px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.05em
color dot: colored circle (blue for metric 1, gold for metric 2)
```

**Line chart**:
- Line 1: `#5AB4D6` (medium blue) — "New Leads"
- Line 2: `#F0A500` (amber/gold) — "Avg. Speed to Action"
- Area fill under line 2: very pale yellow/cream `~rgba(240,165,0,0.08)`
- Grid lines: not visible (clean, no gridlines shown)
- Axes: minimal, light gray

**KPI metric cards** (5 cards in a row):
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
padding: 14px 16px
```
Layout:
- Label: ~11px, gray weight 400 (e.g., "Avg. speed to action")
- Value: ~22–24px, weight 700, dark charcoal (e.g., "2 minutes")
- Trend: ~11px, with ↑ arrow, gray (e.g., "↑ 5% vs last 10 days")
- Sparkline: tiny line chart in bottom-right, gray/light

**Data table** (Agent report):
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
```
Column headers: Name, New Leads, Appointments, Avg.Contact Attempts, Deals Closed (active/highlighted column), Deal Value
- Active column header: `#F5A623` (gold) — "Deals Closed" shown in amber, indicating sort
- Header text: ~12px, gray weight 500
- Row data: blurred (privacy), but color treatment shows:
  - Yellow/amber pills for highlighted metric column
  - Dark gray pills for secondary columns
  - Circular avatar left of name
- Row height: ~56px
- Divider: 1px solid `#F1F5F9`

**Team Leaderboard card** (overlay):
```
background: #161616 (dark)
color: #FFFFFF
border-radius: 12px
padding: 16px
```
Layout: 3 agent cards side by side
Each card: large circular avatar (top, ~56px) with rank badge (small dark circle with number), metric value in gold `#F5A623` (e.g., "$3.4M"), label below in uppercase small gray text ("DEALS CLOSED")

Bottom stat bar: icon + label pairs in small gray text

---

## 8. ACTION PLANS VIEW

**Modal/panel header**:
```
background: #161616
color: #FFFFFF
padding: 16px 20px
border-radius: 12px 12px 0 0
font-size: 16px
font-weight: 600
```
Close button: white × top-right

**Panel body**:
```
background: #F5F5F5 (outer) + #FFFFFF (inner card)
border-radius: 0 0 12px 12px
padding: 16px
```

**Timeline row structure**:
- Left: numbered circle (~32px diameter)
  - Active step: `#29B6D1` (teal-blue) with white number
  - Inactive/done step: `#6B7280` (gray) with white number
- Vertical connecting line between steps: thin gray line ~1px
- Step label: "Immediately", "2nd Day", "3rd Day" — ~14px, teal-blue color
- Action type: "Text", "Email", "Run" — ~14px, teal-blue
- Divider between rows: 1px solid `#E5E7EB`

**Action plan list** (running plans on contact):
- Container: white card in light gray page bg
- Each row: plan name left, status badge pill right, ~60px row height
- Divider: 1px horizontal rule between rows

**Status badge pills** (see Section 4 above):
- RUNNING: teal `#4CBDD9`
- PAUSED: red `#E84545`
- COMPLETED: gold `#F5A623`

---

## 9. COMMUNICATIONS / INBOX

**Team Inbox Setup** (Admin screenshot):
- **Top navigation**: Dark navy/charcoal bar — consistent with main nav `~#2C3A47`
- **Sub-navigation**: White bar below with tabs underlined in blue
- **Content area**: Light gray `#F5F5F7` background

**Conversation Thread View** (desktop):
- White background
- Each message row: no card, just inline layout
- Sender info: bold name + arrow (→) + recipient — ~14px, charcoal, weight 600
- Timestamp: right-aligned, ~12px, gray
- Message body: 1–2 lines, ~14px, regular weight, darker gray
- Thread icon: small circular icon ~24px, slate blue, left of each item
- Items separated by spacing only (no dividers between messages)

**SMS Mobile View**:
```
/* Outbound bubbles (agent) */
background: #0041D9 or similar blue
color: #FFFFFF
border-radius: 18px 18px 4px 18px
max-width: 75%
margin-left: auto (right-aligned)
padding: 10px 14px

/* Inbound bubbles (lead) */
background: #E8EDF2 (very light gray-blue)
color: #1A1A2E (dark)
border-radius: 18px 18px 18px 4px
max-width: 75%
margin-right: auto (left-aligned)
padding: 10px 14px
```

---

## 10. MARKETING WEBSITE COMPONENTS

### Navigation Bar
```
position: sticky; top: 0
background: transparent (at top) → #FFFFFF (on scroll)
transition: background 0.3s
height: ~64px
padding: 0 24px
```
On scroll: white background, logo opacity 0→1 transition, transform translateY(-100%) then back

### Section Backgrounds
- Default: `#FFFFFF`
- Alternate sections: `#F9F9F9` or `#F2F1EC`
- No dark-mode sections on marketing site (all light)

### Marketing Buttons
Primary CTA: "Start Free Trial", "Get a Demo"
```
background: #161616
color: #FFFFFF
border-radius: 12px
height: 44px
padding: 10px 20px
font-size: 14px
font-weight: 700
```
Hover:
```
background: #FFFFFF
color: #161616
border: 1px solid #161616
```

Filter/Tag Pills (Integrations page):
```
/* Default */
background: #161616
color: #FFFFFF
border-radius: 12px
padding: 10px 16px
font-size: 14px
font-weight: 700
transition: all 0.2s

/* Hover */
background: #FFFFFF
color: #161616
border: 1px solid #161616
```

### Pricing Cards
```
border: 1px solid #CDCDD3
border-radius: 12px
padding: 24px
background: #FFFFFF
```
"Most Popular" indicator: CSS triangle/ribbon above card in `#CFE9F6` (light blue)

Feature checkmarks: green circle SVG icon `67d0c49bcec95f578c2d3ffb_CheckCircle.svg`
Unavailable features: dash `—` character

### Integration/Partner Cards
```
background: #FFFFFF
border: 1px solid #CDCDD3 or #E5E7EB
border-radius: 8px
padding: 16–20px
```
Logo + title + 1–2 line description, full card is clickable

---

## 11. SPACING SYSTEM

The site uses utility classes rather than a strict 8px grid, but the visual rhythm suggests:

| Scale | Value | Usage |
|---|---|---|
| xs | 4px | Icon internal padding, tiny gaps |
| sm | 8px | Row internal padding, badge padding |
| md | 12px | Card internal padding, gap between items |
| lg | 16px | Standard content padding |
| xl | 20–24px | Section padding, card padding |
| 2xl | 32–40px | Between section blocks |
| 3xl | 48–64px | Hero section vertical padding |

Table row height: ~64–72px
Nav bar height: ~52px (app), ~64px (marketing)
Modal header height: ~48px

---

## 12. SHADOWS & DEPTH SYSTEM

The FUB aesthetic is **very flat with minimal shadows**. Surfaces are differentiated primarily by background color rather than shadow elevation.

| Level | CSS | Usage |
|---|---|---|
| Base | none | Page background |
| Elevated | `box-shadow: 0 1px 2px rgba(0,0,0,0.06)` | Deal cards |
| Card | `box-shadow: 0 1px 4px rgba(0,0,0,0.08)` | Table containers, metric cards |
| Modal | `box-shadow: 0 8px 32px rgba(0,0,0,0.16)` | Overlays, lead detail panels |
| Floating | `box-shadow: 0 16px 48px rgba(0,0,0,0.2)` | Dropdown menus |

The dark modal headers (`#161616`) create strong visual hierarchy without relying on shadow.

---

## 13. BORDER RADIUS SYSTEM

| Use | Value |
|---|---|
| Pills / badges / status chips | `999px` (full round) |
| Buttons (marketing) | `12px` |
| Buttons (app, small) | `6–8px` |
| Cards / containers | `8px` |
| Modals / panels | `12px` |
| Table rows | `0` (sharp) |
| Avatars | `50%` (circle) |
| Input fields | `4–6px` |

---

## 14. INTERACTIVE STATES

All interactive elements follow these patterns:

- **Focus**: `outline: 0.125rem solid #4D65FF; outline-offset: 0.125rem` (keyboard nav)
- **Hover (dark buttons)**: Invert to white background + dark border
- **Hover (table rows)**: Subtle background shift to `#F9FAFB`
- **Hover (links)**: `text-decoration: underline`
- **Active tab**: Bold weight + blue underline (`2–3px solid #0041D9`)
- **Transitions**: `0.2s ease` for background-color, color, border-color
  - Never `transition: all` — always specific properties

---

## 15. KEY DESIGN PHILOSOPHY NOTES

1. **Dark headers, light bodies**: Every modal, panel, and section uses a `#161616` dark header bar with white text, then transitions to a white or light gray body. This is the most distinctive FUB UI pattern.

2. **Three brand accent colors as status signals**: The red/yellow/blue from the logo are reused as semantic status colors throughout the app (PAUSED=red, COMPLETED=gold, RUNNING=teal-blue).

3. **Minimal ornamentation**: No gradients in the app UI. Backgrounds are flat colors. Depth comes from color contrast (dark header vs. light body) rather than shadows.

4. **Circular avatars everywhere**: Every person (contact, agent, user) is represented by a circular photo or initial-based avatar. This is consistent across all views.

5. **Tables over cards for data**: Lead lists use clean white tables with minimal dividers, not card-per-record layouts.

6. **Typography contrast via weight, not size**: Column headers vs. data use the same ~14px size but different weights (500 header, 600 primary data, 400 secondary data) rather than large size jumps.

7. **Color-coded data columns**: In reports, the active/highlighted sort column uses gold `#F5A623` for the data pills, creating instant visual hierarchy.

8. **Pipeline uses color-topped columns**: Kanban stages are identified by a colored top-border accent strip rather than full column color fills.
