import type { Account } from '@/lib/types'

export default function SavingsCard({ account }: { account: Account }) {
  return (
    <div className="bg-white rounded-[14px] p-3 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: account.color }} />
      <p className="text-[10px] font-bold tracking-wider uppercase text-[#8B90A7] mt-1">{account.name}</p>
      <p className="text-[9px] text-[#B0B5C8]">{account.institution}</p>
      <p className="text-[17px] font-extrabold text-[#1A1C2E] mt-3 tracking-tight">
        {Number(account.balance).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] text-[#8B90A7]">MYR</p>
    </div>
  )
}
