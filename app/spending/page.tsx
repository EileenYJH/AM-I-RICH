import { createServerClient } from '@/lib/supabase'
import TransactionList from '@/components/TransactionList'

export const revalidate = 60

export default async function SpendingPage() {
  const db = createServerClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: transactions } = await db
    .from('transactions')
    .select('*, account:accounts(name, color)')
    .gte('date', monthStart)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const txns = (transactions ?? []) as any[]
  const totalSpent = txns
    .filter(t => Number(t.amount) < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)

  const monthName = now.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })

  return (
    <div className="pt-4">
      <div className="px-4 pb-3">
        <h1 className="text-[26px] font-extrabold text-[#1A1C2E] tracking-tight">Spending</h1>
        <p className="text-xs text-[#8B90A7] mt-0.5">
          {monthName} · RM {totalSpent.toLocaleString('en-MY', { minimumFractionDigits: 2 })} spent
        </p>
      </div>
      <TransactionList transactions={txns} />
    </div>
  )
}
