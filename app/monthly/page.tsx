import { createServerClient } from '@/lib/supabase'
import MonthlyChart from '@/components/MonthlyChart'

export const revalidate = 60

export default async function MonthlyPage() {
  const db = createServerClient()
  const now = new Date()

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]
  const { data: transactions } = await db
    .from('transactions')
    .select('amount, date, category')
    .gte('date', sixMonthsAgo)

  const txns = transactions ?? []

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-MY', { month: 'short' }),
    }
  })

  const spendByMonth = Object.fromEntries(monthLabels.map(m => [m.key, 0]))
  for (const t of txns) {
    const key = t.date.slice(0, 7)
    if (key in spendByMonth && Number(t.amount) < 0) {
      spendByMonth[key] += Math.abs(Number(t.amount))
    }
  }

  const months = monthLabels.map(m => ({ month: m.label, spent: spendByMonth[m.key] }))

  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = txns.filter(t => t.date.startsWith(thisMonthKey))

  const spent = thisMonth.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  const income = thisMonth.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0)

  const catMap: Record<string, { total: number; count: number }> = {}
  for (const t of thisMonth.filter(t => Number(t.amount) < 0)) {
    const cat = t.category ?? 'other'
    catMap[cat] = catMap[cat] ?? { total: 0, count: 0 }
    catMap[cat].total += Math.abs(Number(t.amount))
    catMap[cat].count += 1
  }
  const categories = Object.entries(catMap)
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="pt-4">
      <div className="px-4 pb-3">
        <h1 className="text-[26px] font-extrabold text-[#1A1C2E] tracking-tight">Monthly</h1>
        <p className="text-xs text-[#8B90A7] mt-0.5">Spending overview</p>
      </div>
      <MonthlyChart months={months} categories={categories} spent={spent} income={income} />
    </div>
  )
}
