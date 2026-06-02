# Deployment Guide

## 1. Supabase Setup

1. Go to https://supabase.com → New project → name it "am-i-rich"
2. SQL Editor → run `supabase/migrations/001_initial_schema.sql`
3. SQL Editor → run `supabase/migrations/002_transaction_unique.sql`
4. Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Generate INGEST_SECRET

Run in terminal:
```
openssl rand -hex 32
```
Save the output as your `INGEST_SECRET`.

## 3. Deploy to Vercel

1. Push repo to GitHub (if not already):
   ```
   git remote add origin https://github.com/EileenYJH/AM-I-RICH.git
   git push -u origin main
   ```
2. Go to https://vercel.com → New Project → import from GitHub → select AM-I-RICH
3. Framework: Next.js (auto-detected)
4. Environment Variables — add all 4:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `INGEST_SECRET`
5. Click Deploy. App will be at `https://am-i-rich.vercel.app` (or similar).

## 4. Test the ingest endpoint

```bash
curl -X POST https://YOUR-APP.vercel.app/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  -d '{"text":"MAE\nAvailable Balance\nRM 4210.00"}'
```
Expected: `{"status":"success","institution":"Maybank","balance":4210,"txCount":0}`

## 5. Apple Shortcuts Automation (one-time setup)

On your iPhone:

1. Open **Shortcuts** app → **Automation** tab → **+** → **Personal Automation**
2. Trigger: **Screenshot** → tap Next
3. Add these actions in order:
   - **Get Latest Photos** → Count: 1
   - **Extract Text from Image** → Image: Photos from step above
   - **Get Contents of URL**:
     - URL: `https://YOUR-APP.vercel.app/api/ingest`
     - Method: **POST**
     - Headers:
       - `Authorization` = `Bearer YOUR_INGEST_SECRET`
       - `Content-Type` = `application/json`
     - Request Body: **JSON**
       - Key: `text` → Value: **Text** (variable from Extract Text step)
4. Tap **Next** → turn off **"Ask Before Running"** → tap **Done**

Now every screenshot you take will automatically send OCR text to the app.

## 6. Install as PWA on iPhone

1. Open `https://YOUR-APP.vercel.app` in **Safari** on iPhone
2. Tap the **Share** button → **Add to Home Screen**
3. Name it "Am I Rich?" → tap **Add**

The app opens full-screen from your home screen.

## Supported Institutions

Screenshots from these apps are automatically parsed:

| App | Institution |
|-----|-------------|
| MAE | Maybank |
| CIMB Clicks | CIMB |
| PBe | Public Bank |
| Touch 'n Go eWallet | Touch n Go |
| GrabPay | GrabPay |
| Boost | Boost |
| myASNB | ASNB |
| Any bank FD screen | Fixed Deposit |

## Updating Parser Rules

If a bank updates its app layout and screenshots stop parsing:
1. Open `lib/parsers/<institution>.ts`
2. Update the regex patterns to match the new OCR text format
3. Update the corresponding test in `__tests__/parsers/<institution>.test.ts` with a new sample
4. Run `npm test` to verify
5. Deploy to Vercel (auto-deploys on push to main)
