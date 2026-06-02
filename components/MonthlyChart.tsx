'use client'

interface MonthData { month: string; spent: number }
interface CategoryData { category: string; total: number; count: number }

const CAT_ICONS: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛍️', bills: '⚡', income: '💸', other: '💳',
}
const CAT_COLORS: Record<string, string> = {
  food: '#FF9800', transport: '#1A9E6A', shopping: '#6C63FF', bills: '#E8344A', other: '#B0B5C8',
}

export default function MonthlyChart({
  months, categories, spent, income,
}: {
  months: MonthData[]
  categories: CategoryData[]
  spent: number
  income: number
}) {
  const maxSpend = Math.max(...months.map(m => m.spent), 1)
  const saved = income - spent

  return (
    <>
      <div className="flex gap-2 mx-4 mb-3">
        {[
          { label: 'Spent',  value: spent,  cls: 'text-[#E8344A]' },
          { label: 'Income', value: income, cls: 'text-[#1A9E6A]' },
          { label: 'Saved',  value: saved,  cls: 'text-[#1A1C2E]' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex-1 bg-white rounded-[13px] p-3 shadow-sm">
            <p className="text-[9px] font-bold tracking-widest uppercase text-[#B0B5C8]">{label}</p>
            <p className={`text-base font-extrabold mt-1 tracking-tight ${cls}`}>
              RM {Math.abs(value).toLocaleString('en-MY', { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-3 bg-white rounded-[18px] p-4 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B90A7] mb-3">Monthly spend</p>
        <div className="flex items-end gap-2 h-16">
          {months.map((m, i) => {
            const isLast = i === months.length - 1
            const heightPct = (m.spent / maxSpend) * 100
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-[4px]"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    background: isLast ? '#6C63FF' : '#EEF0FA',
                  }}
                />
                <span className={`text-[9px] font-semibold ${isLast ? 'text-[#6C63FF]' : 'text-[#B0B5C8]'}`}>
                  {m.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="px-4 pb-2 text-[10px] font-bold tracking-widest uppercase text-[#8B90A7]">
        This month by category
      </p>
      <div className="mx-4 bg-white rounded-[18px] overflow-hidden shadow-sm">
        {categories.length === 0 && (
          <p className="text-center text-[#B0B5C8] text-sm py-8">No spending data yet</p>
        )}
        {categories.map((cat, i) => (
          <div key={cat.category} className={`flex items-center gap-3 px-4 py-3 ${i < categories.length - 1 ? 'border-b border-[#F2F4FA]' : ''}`}>
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
              style={{ background: (CAT_COLORS[cat.category] ?? '#EEF0FA') + '22' }}
            >
              {CAT_ICONS[cat.category] ?? '💳'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#1A1C2E] capitalize">{cat.category}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 bg-[#F2F4FA] rounded h-1">
                  <div
                    className="h-1 rounded"
                    style={{
                      width: `${(cat.total / (spent || 1)) * 100}%`,
                      background: CAT_COLORS[cat.category] ?? '#B0B5C8',
                    }}
                  />
                </div>
                <span className="text-[9px] text-[#B0B5C8] flex-shrink-0">{cat.count} txn</span>
              </div>
            </div>
            <p className="text-xs font-extrabold text-[#1A1C2E] flex-shrink-0">
              RM {cat.total.toLocaleString('en-MY', { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
