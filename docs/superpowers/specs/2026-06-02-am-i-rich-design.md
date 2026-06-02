# AM I RICH — Design Spec
**Date:** 2026-06-02  
**Status:** Approved

---

## Problem

Money is scattered across multiple Malaysian bank accounts, e-wallets, and savings instruments. Manual tracking is too tedious to sustain. The goal is a personal finance app that auto-updates balances from screenshots with minimal user effort.

---

## Solution Overview

A PWA (Progressive Web App) installable on iPhone that:
1. Uses Apple Shortcuts automation to extract text from screenshots on-device (free, no API)
2. POSTs the extracted text to the backend, which runs institution-specific parsers to pull out balances and transactions
3. Displays a unified dashboard showing all accounts, spending history, and monthly summaries

No App Store required. No $99/yr Apple Developer account. No AI API costs. Deployed free to Vercel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) — PWA |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL, free tier) |
| OCR | Apple Vision framework (via Shortcuts, on-device, free) |
| Text parsing | Custom regex parsers per institution (backend) |
| Automation | Apple Shortcuts (iOS Personal Automation) |
| Hosting | Vercel (free tier) |

---

## Accounts in Scope

### Accounts & eWallets
| Account | Institution | Brand Color |
|---|---|---|
| MAE | Maybank | `#F0A800` |
| Savings | CIMB | `#D4002B` |
| Savings | Public Bank | `#0040A8` |
| eWallet | Touch 'n Go (TNG) | `#0088E8` |
| eWallet | GrabPay | `#00B352` |
| eWallet | Boost | `#FF5030` |

### Savings & Investments
| Account | Institution | Brand Color |
|---|---|---|
| Unit Trust | ASNB | `#006B3E` |
| Fixed Deposit | Any bank (multiple placements) | `#2D3561` |

Each FD placement is tracked individually. One screenshot per new placement creates a new FD record. Multiple active FD placements are supported.

---

## Screenshot Ingestion Flow

```
User takes screenshot in banking/ewallet app
        ↓
iOS Personal Automation triggers (Screenshot trigger, iOS 16+)
        ↓
Shortcut: Get Latest Photo → "Extract Text from Image" (Apple on-device OCR, free)
        ↓
Shortcut: POST { text: "<extracted text>" } to /api/ingest
  (Bearer token in Shortcut for auth)
        ↓
Backend: auto-detect institution from keyword signatures in text
        ↓
Backend: run institution-specific parser → extract balance + transactions
        ↓
API: upsert accounts.balance, insert new transactions
        ↓
User opens PWA → balances already updated
```

**One-time Shortcuts setup:** iOS Shortcuts → Automations → New Automation → "Screenshot" → Get Latest Photo from Album → Extract Text from Image → Get Contents of URL (POST to `https://your-app.vercel.app/api/ingest`, body: `{ "text": [extracted text] }`, Authorization header with Bearer token).

**ASNB & Fixed Deposit:** These accounts do not have transaction histories accessible via screenshot — only a current balance. Their parsers return `transactions: []` and only update `accounts.balance`. Screenshots of the ASNB app portfolio page and bank FD summary page are supported.

---

## Text Parsing Strategy

The `/api/ingest` endpoint receives raw OCR text and processes it in two steps:

### Step 1 — Institution detection
Each institution has a unique set of keyword signatures that appear reliably in its OCR output:

| Institution | Detection keywords |
|---|---|
| MAE / Maybank | `"MAE"`, `"Maybank"`, `"Available Balance"` |
| CIMB | `"CIMB"`, `"CIMB Clicks"`, `"Current Balance"` |
| Public Bank | `"Public Bank"`, `"PBe"`, `"Available Balance"` |
| TNG eWallet | `"Touch 'n Go"`, `"TNG"`, `"eWallet Balance"` |
| GrabPay | `"GrabPay"`, `"Grab"`, `"Wallet Balance"` |
| Boost | `"Boost"`, `"My Balance"` |
| ASNB | `"ASNB"`, `"Amanah Saham"`, `"Unit Held"` |
| Fixed Deposit | `"Fixed Deposit"`, `"FD"`, `"Maturity Date"`, `"Placement Date"`, `"p.a."` |

If no institution is detected, the ingest is logged as `status: "unrecognised"` and skipped.

### Step 2 — Per-institution parser
Each institution gets its own parser function (`parsers/maybank.ts`, `parsers/tng.ts`, etc.) that uses regex to extract:
- **Balance:** the primary numeric balance value (e.g. match `RM\s*([\d,]+\.\d{2})` near known label)
- **Transactions:** repeated patterns of date + merchant + amount (best-effort; not all app screens show transaction history)
- **Transaction category:** keyword matching on merchant name (e.g. "Grab" → transport, "Aeon" → shopping, "TNB" → bills)

Parsers return a typed result: `{ institution, balance, transactions[], parsed_at }`. If the balance regex fails to match, the result is flagged `status: "parse_failed"` and skipped.

**Fixed Deposit parser** extracts additional fields beyond balance:
- `principal` — original amount placed (e.g. `RM 1,000.00`)
- `interest_rate` — interest rate per annum (e.g. `3.50% p.a.`)
- `placement_date` — date the FD was opened
- `maturity_date` — date the FD matures
- `interest_amount` — total interest to be earned (parsed or calculated: `principal × rate × days/365`)
- `total_at_maturity` — principal + interest_amount

Each FD screenshot creates a **new `fixed_deposits` row** rather than updating an existing account balance. The FD section on the dashboard sums all active placements.

**Parser maintenance:** If a bank updates its app layout, only the regex for that parser needs updating — other accounts are unaffected.

---

## Data Model

### `accounts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | Display name e.g. "MAE", "TNG" |
| institution | text | e.g. "Maybank", "Touch 'n Go" |
| type | enum | `bank`, `ewallet`, `savings`, `fd` |
| color | text | Hex brand color |
| balance | numeric | Current balance in MYR |
| updated_at | timestamptz | Last screenshot update |

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| account_id | uuid FK → accounts | |
| amount | numeric | Negative = debit, positive = credit |
| merchant | text | Parsed merchant name |
| category | text | Keyword-matched from merchant name in parser: food, transport, shopping, bills, income |
| date | date | Transaction date |
| source | enum | `screenshot`, `manual` |

### `fixed_deposits`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| institution | text | e.g. "Maybank", "CIMB" |
| principal | numeric | Original amount placed (MYR) |
| interest_rate | numeric | % per annum e.g. `3.50` |
| placement_date | date | Date FD was opened |
| maturity_date | date | Date FD matures |
| interest_amount | numeric | Total interest earned at maturity |
| total_at_maturity | numeric | principal + interest_amount |
| status | enum | `active`, `matured` — auto-set to `matured` when maturity_date passes |
| created_at | timestamptz | When this record was created (screenshot processed) |

Each new FD placement screenshot inserts a new row. Matured FDs are kept for history but excluded from the net worth total.

### `ingest_log`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| received_at | timestamptz | |
| status | enum | `success`, `parse_failed`, `unrecognised` |
| account_id | uuid FK | Nullable — null if institution unrecognised |
| raw_text | text | Raw OCR text received from Shortcut (for debugging parsers) |

---

## Pages & Navigation

4-tab bottom navigation: **Dashboard · Spending · Monthly · Add**

### Dashboard
- App header: greeting + "Am I Rich? 💰" title + avatar
- Dark net worth banner: total MYR across all accounts + % change vs previous month
- **Accounts & eWallets section** — 3×2 grid, all 6 cards visible (no horizontal scroll), brand colors
- **Savings & Investments section** — 2-column grid, white cards with coloured top strip (ASNB green, FD navy)
  - ASNB card: balance + last updated date
  - FD card(s): each active placement shows principal, interest rate (% p.a.), maturity date, and total benefit at maturity. Multiple active placements appear as separate cards. A "Matures in X days" label highlights upcoming maturity dates.
- No scrolling required — all accounts fit one screen

### Spending
- Page title + current month subtitle + total spent
- Category filter pills: All / Food / Transport / Shopping / Bills
- Transaction list: icon + merchant name + account + timestamp + amount
- Income entries shown in green, debits in red

### Monthly
- Summary row: Spent / Income / Saved (3 cards)
- Bar chart: spend per month, current month highlighted in `#6C63FF`
- Category breakdown list: icon + name + transaction count + mini progress bar + total

### Add (manual fallback)
- Form to manually enter a balance update or transaction
- For accounts that are hard to parse via screenshot (e.g. ASNB statement PDFs)

---

## Visual Design

- **Theme:** Light enterprise
- **Background:** `#F2F4FA`
- **Primary accent:** `#6C63FF` (purple — nav active state, bar chart, highlights)
- **Typography:** System font (SF Pro on iOS)
- **Cards:** Colored gradient backgrounds (account cards) or white with shadow (savings cards)
- **Nav:** Frosted glass bottom tab bar with active purple dot indicator

---

## Security

- `/api/ingest` protected by a static Bearer token stored as a Vercel environment variable
- Token is also stored in the iOS Shortcut — never in the frontend bundle
- All data is personal/private — no multi-user auth required for v1
- Supabase Row Level Security enabled but single-user schema (no user table needed)

---

## Out of Scope (v1)

- Multi-user / shared access
- Credit card debt tracking
- Investment P&L (ASNB shows balance only, no unit price history)
- Notifications / alerts
- Android support
- Exporting data

---

## Success Criteria

1. Taking a screenshot in MAE, CIMB, TNG, GrabPay, or Boost auto-updates the balance in the app within seconds
2. Dashboard shows all 8 account balances on one screen with no scrolling
3. Spending page shows transactions with correct account attribution
4. Monthly page correctly totals income vs spending
5. App installs to iPhone home screen and works offline for viewing (reads from local cache)
