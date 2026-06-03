'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FixedDeposit } from '@/lib/types'
import { deleteFD } from '@/app/actions'

export default function FDCard({ fd }: { fd: FixedDeposit }) {
  const router = useRouter()
  const [gone, setGone] = useState(false)
  const daysLeft = Math.ceil((new Date(fd.maturity_date).getTime() - Date.now()) / 86_400_000)
  const urgent = daysLeft <= 30

  async function handleDelete() {
    if (!confirm(`Remove this ${fd.institution} FD (RM ${Number(fd.principal).toLocaleString('en-MY', { minimumFractionDigits: 2 })})?`)) return
    setGone(true)
    await deleteFD(fd.id)
    router.refresh()
  }

  if (gone) return null

  return (
    <div className="bg-white rounded-[14px] p-3 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px] bg-[#2D3561]" />
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/8 flex items-center justify-center text-[#8B90A7] text-[10px] hover:bg-red-50 hover:text-red-400 transition-colors z-10"
        aria-label="Remove FD"
      >✕</button>
      <div className="flex justify-between items-start mt-1 pr-6">
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#8B90A7]">Fixed Deposit</p>
          <p className="text-[9px] text-[#B0B5C8]">{fd.institution}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${urgent ? 'bg-red-50 text-red-500' : 'bg-[#EEF0FA] text-[#6C63FF]'}`}>
          {daysLeft > 0 ? `${daysLeft}d left` : 'Matured'}
        </span>
      </div>
      <p className="text-[17px] font-extrabold text-[#1A1C2E] mt-2 tracking-tight">
        {Number(fd.principal).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] text-[#8B90A7]">MYR · {fd.interest_rate}% p.a.</p>
      <div className="mt-2 pt-2 border-t border-[#F2F4FA] flex justify-between">
        <span className="text-[9px] text-[#B0B5C8]">
          Matures {new Date(fd.maturity_date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-[9px] font-bold text-[#1A9E6A]">
          +{Number(fd.interest_amount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
