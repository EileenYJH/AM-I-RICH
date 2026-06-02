# AM I RICH — Design Spec
**Date:** 2026-06-02  
**Status:** Approved

---

## Problem

Money is scattered across multiple Malaysian bank accounts, e-wallets, and savings instruments. Manual tracking is too tedious to sustain. The goal is a personal finance app that auto-updates balances from screenshots with minimal user effort.

---

## Solution Overview

A PWA (Progressive Web App) installable on iPhone that:
1. Receives screenshots via Apple Shortcuts automation (triggered automatically on screenshot)
2. Parses them with Claude Vision API to extract balances and transactions
3. Displays a unified dashboard showing all accounts, spending history, and monthly summaries

No App Store required. No $99/yr Apple Developer account. Deployed free to Vercel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) — PWA |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL, free tier) |
| AI parsing | Claude Vision API (claude-haiku-4-5) |
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
| Fixed Deposit | Maybank (or others) | `#2D3561` |

---

## Screenshot Ingestion Flow

```
User takes screenshot in banking/ewallet app
        ↓
iOS Personal Automation triggers (Screenshot trigger, iOS 16+)
        ↓
Shortcut: Get Latest Photo → base64 encode → POST /api/ingest
  (Bearer token in Shortcut for auth)
        ↓
API route receives image → sends to Claude Vision API
  with structured extraction prompt
        ↓
Claude returns JSON: { account, institution, balance, transactions[] }
        ↓
API: upsert accounts.balance, insert new transactions
        ↓
User opens PWA → balances already updated
```

**One-time Shortcuts setup:** iOS Shortcuts → Automations → New Automation → "Screenshot" → Get Latest Photo from Album → Get Contents of URL (POST to `https://your-app.vercel.app/api/ingest`, Authorization header with Bearer token).

**ASNB & Fixed Deposit:** These accounts do not have transaction histories accessible via screenshot — only a current balance. The Claude Vision extraction for these returns `transactions: []` and only updates `accounts.balance`. Screenshots of the ASNB app portfolio page and bank FD summary page are supported.

---

## Claude Vision Prompt Strategy

The `/api/ingest` endpoint sends the screenshot to Claude Vision with a prompt that:
- Specifies known Malaysian bank/ewallet app UI patterns
- Requests a strict JSON response:
  ```json
  {
    "institution": "Maybank",
    "account_type": "MAE",
    "balance": 4210.00,
    "currency": "MYR",
    "transactions": [
      { "amount": -8.50, "merchant": "Tealive", "date": "2026-06-02", "type": "debit" }
    ],
    "confidence": "high"
  }
  ```
- If `confidence` is `"low"`, the API flags the entry for manual review instead of auto-saving.

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
| category | text | Categorised by Claude Vision during parsing: food, transport, shopping, bills, income |
| date | date | Transaction date |
| source | enum | `screenshot`, `manual` |

### `ingest_log`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| received_at | timestamptz | |
| status | enum | `success`, `low_confidence`, `failed` |
| account_id | uuid FK | Nullable — null if institution unrecognised |
| raw_response | jsonb | Full Claude response for debugging |

---

## Pages & Navigation

4-tab bottom navigation: **Dashboard · Spending · Monthly · Add**

### Dashboard
- App header: greeting + "Am I Rich? 💰" title + avatar
- Dark net worth banner: total MYR across all accounts + % change vs previous month
- **Accounts & eWallets section** — 3×2 grid, all 6 cards visible (no horizontal scroll), brand colors
- **Savings & Investments section** — 2-column grid, white cards with coloured top strip (ASNB green, FD navy)
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
