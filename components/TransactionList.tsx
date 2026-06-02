'use client'
import { useState } from 'react'
import type { Transaction } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛍️', bills: '⚡', income: '💸', other: '💳',
}
const CATEGORY_COLORS: Record<string, string> = {
  food: '#FFF3E0', transport: '#E8F5E9', shopping: '#EDE7FF', bills: '#FFECE9', income: '#E8F5E9', other: '#F2F4FA',
}
const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Income']

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? transactions
    : transactions.filter(t => t.category === filter.toLowerCase())

  return (
    <>
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === cat ? 'bg-[#6C63FF] text-white' : 'bg-white text-[#8B90A7] border border-black/5 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mx-4 bg-white rounded-[18px] overflow-hidden shadow-sm">
        {filtered.length === 0 && (
          <p className="text-center text-[#B0B5C8] text-sm py-8">No transactions</p>
        )}
        {filtered.map((txn, i) => (
          <div key={txn.id} className={`flex items-center gap-3 px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-[#F2F4FA]' : ''}`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: CATEGORY_COLORS[txn.category] ?? CATEGORY_COLORS.other }}
            >
              {CATEGORY_ICONS[txn.category] ?? '💳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1C2E] truncate">{txn.merchant}</p>
              <p className="text-[10px] text-[#B0B5C8] mt-0.5">
                {(txn.account as any)?.name ?? ''} · {new Date(txn.date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <p className={`text-sm font-extrabold flex-shrink-0 ${Number(txn.amount) >= 0 ? 'text-[#1A9E6A]' : 'text-[#E8344A]'}`}>
              {Number(txn.amount) >= 0 ? '+' : ''}RM {Math.abs(Number(txn.amount)).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
