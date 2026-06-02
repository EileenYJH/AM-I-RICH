'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { Account } from '@/lib/types'

export default function AddPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [mode, setMode] = useState<'balance' | 'transaction'>('balance')
  const [accountId, setAccountId] = useState('')
  const [balance, setBalance] = useState('')
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    createBrowserClient()
      .from('accounts')
      .select('*')
      .order('institution')
      .then(({ data }) => {
        setAccounts(data ?? [])
        if (data?.length) setAccountId(data[0].id)
      })
  }, [])

  async function save() {
    if (!accountId) return
    setStatus('saving')
    const db = createBrowserClient()

    if (mode === 'balance') {
      const { error } = await db
        .from('accounts')
        .update({ balance: parseFloat(balance), updated_at: new Date().toISOString() })
        .eq('id', accountId)
      setStatus(error ? 'error' : 'saved')
    } else {
      const { error } = await db.from('transactions').insert({
        account_id: accountId,
        amount: parseFloat(amount),
        merchant,
        category: 'other',
        date,
        source: 'manual',
      })
      setStatus(error ? 'error' : 'saved')
      if (!error) { setMerchant(''); setAmount('') }
    }

    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="pt-4 px-4">
      <h1 className="text-[26px] font-extrabold text-[#1A1C2E] tracking-tight mb-1">Add</h1>
      <p className="text-xs text-[#8B90A7] mb-4">Manual balance update or transaction</p>

      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-4">
        {(['balance', 'transaction'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              mode === m ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#8B90A7]'
            }`}
          >
            {m === 'balance' ? 'Update Balance' : 'Add Transaction'}
          </button>
        ))}
      </div>

      <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-1">Account</label>
      <select
        value={accountId}
        onChange={e => setAccountId(e.target.value)}
        className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm text-[#1A1C2E] font-semibold mb-3 shadow-sm"
      >
        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {a.institution}</option>)}
      </select>

      {mode === 'balance' ? (
        <>
          <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-1">Balance (MYR)</label>
          <input
            type="number" step="0.01" value={balance}
            onChange={e => setBalance(e.target.value)} placeholder="0.00"
            className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm text-[#1A1C2E] mb-4 shadow-sm"
          />
        </>
      ) : (
        <>
          <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-1">Merchant</label>
          <input
            type="text" value={merchant}
            onChange={e => setMerchant(e.target.value)} placeholder="e.g. Tealive"
            className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm text-[#1A1C2E] mb-3 shadow-sm"
          />
          <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-1">Amount (negative = spend)</label>
          <input
            type="number" step="0.01" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="-8.50"
            className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm text-[#1A1C2E] mb-3 shadow-sm"
          />
          <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-1">Date</label>
          <input
            type="date" value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm text-[#1A1C2E] mb-4 shadow-sm"
          />
        </>
      )}

      <button
        onClick={save}
        disabled={status === 'saving'}
        className="w-full bg-[#6C63FF] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
      >
        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : status === 'error' ? 'Error — try again' : 'Save'}
      </button>
    </div>
  )
}
