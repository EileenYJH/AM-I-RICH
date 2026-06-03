import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { detectAndParse } from '@/lib/parsers/index'
import { categorise } from '@/lib/categories'

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = detectAndParse(text)
  const db = createServerClient()

  async function log(status: string, accountId?: string) {
    await db.from('ingest_log').insert({
      status,
      account_id: accountId ?? null,
      raw_text: text,
    })
  }

  if (parsed.type === 'unrecognised') {
    await log('unrecognised')
    return NextResponse.json({ status: 'unrecognised' })
  }

  if (parsed.type === 'parse_failed') {
    await log('parse_failed')
    return NextResponse.json({ status: 'parse_failed', institution: parsed.institution })
  }

  if (parsed.type === 'fd') {
    const rows = parsed.results.map(fd => ({
      institution: fd.institution,
      principal: fd.principal,
      interest_rate: fd.interestRate,
      placement_date: fd.placementDate,
      maturity_date: fd.maturityDate,
      interest_amount: fd.interestAmount,
      total_at_maturity: fd.totalAtMaturity,
      reference: fd.reference,
      status: 'active',
    }))
    // Upsert on reference — re-scanning same screenshot won't create duplicates
    await db.from('fixed_deposits').upsert(rows, {
      onConflict: 'reference',
      ignoreDuplicates: false, // update if rate/amount changed
    })
    await log('success')
    return NextResponse.json({ status: 'success', type: 'fd', count: rows.length, institution: rows[0]?.institution })
  }

  // type === 'account'
  const { institution, accountName, balance, transactions } = parsed.result

  const { data: accounts } = await db
    .from('accounts')
    .select('id')
    .eq('institution', institution)
    .eq('name', accountName)
    .limit(1)

  if (!accounts || accounts.length === 0) {
    await log('parse_failed')
    return NextResponse.json({ status: 'parse_failed', reason: `No account found for ${institution} / ${accountName}` })
  }

  const accountId = accounts[0].id

  await db
    .from('accounts')
    .update({ balance, updated_at: new Date().toISOString() })
    .eq('id', accountId)

  if (transactions.length > 0) {
    const rows = transactions.map(t => ({
      account_id: accountId,
      amount: t.amount,
      merchant: t.merchant,
      category: categorise(t.merchant),
      date: t.date,
      source: 'screenshot' as const,
    }))

    await db.from('transactions').upsert(rows, {
      onConflict: 'account_id,date,merchant,amount',
      ignoreDuplicates: true,
    })
  }

  await log('success', accountId)
  return NextResponse.json({ status: 'success', institution, balance, txCount: transactions.length })
}
