'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account } from '@/lib/types'
import { hideAccount } from '@/app/actions'
import { useLongPress } from '@/hooks/useLongPress'

export default function SavingsCard({ account }: { account: Account }) {
  const router = useRouter()
  const [gone, setGone] = useState(false)
  const { active: deleteMode, start, cancel, dismiss } = useLongPress()

  async function handleDelete() {
    if (!confirm(`Remove ${account.name} (${account.institution})?`)) return
    setGone(true)
    await hideAccount(account.id)
    router.refresh()
  }

  if (gone) return null

  return (
    <div
      className="bg-white rounded-[14px] p-3 shadow-sm relative overflow-hidden select-none"
      style={{ outline: deleteMode ? '2px solid #E8344A' : 'none' }}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchMove={cancel}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onClick={deleteMode ? dismiss : undefined}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: account.color }} />
      {deleteMode && (
        <button
          onClick={e => { e.stopPropagation(); handleDelete() }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] z-10 animate-pulse"
          aria-label="Remove account"
        >✕</button>
      )}
      <p className="text-[10px] font-bold tracking-wider uppercase text-[#8B90A7] mt-1 pr-6">{account.name}</p>
      <p className="text-[9px] text-[#B0B5C8]">{account.institution}</p>
      <p className="text-[17px] font-extrabold text-[#1A1C2E] mt-3 tracking-tight">
        {Number(account.balance).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] text-[#8B90A7]">MYR</p>
    </div>
  )
}
