'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account } from '@/lib/types'
import { hideAccount } from '@/app/actions'
import { useLongPress } from '@/hooks/useLongPress'

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 40)
  const g = Math.max(0, ((n >> 8) & 0xff) - 40)
  const b = Math.max(0, (n & 0xff) - 40)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

export default function AccountCard({ account }: { account: Account }) {
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
      className="rounded-[14px] p-3 relative overflow-hidden shadow-md select-none"
      style={{
        background: `linear-gradient(140deg, ${account.color}, ${darken(account.color)})`,
        outline: deleteMode ? '2px solid rgba(255,255,255,0.5)' : 'none',
      }}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchMove={cancel}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onClick={deleteMode ? dismiss : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
      {deleteMode && (
        <button
          onClick={e => { e.stopPropagation(); handleDelete() }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-white text-[10px] z-10 animate-pulse"
          aria-label="Remove account"
        >✕</button>
      )}
      <p className="text-[10px] font-bold tracking-wider uppercase text-white/85 pr-6">{account.name}</p>
      <p className="text-[9px] text-white/50 mt-0.5">{account.institution}</p>
      <p className="text-[17px] font-extrabold text-white mt-3 tracking-tight leading-none">
        {Number(account.balance).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] text-white/55 mt-0.5">MYR</p>
    </div>
  )
}
