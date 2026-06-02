import type { Account } from '@/lib/types'

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 40)
  const g = Math.max(0, ((n >> 8) & 0xff) - 40)
  const b = Math.max(0, (n & 0xff) - 40)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

export default function AccountCard({ account }: { account: Account }) {
  return (
    <div
      className="rounded-[14px] p-3 relative overflow-hidden shadow-md"
      style={{ background: `linear-gradient(140deg, ${account.color}, ${darken(account.color)})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
      <p className="text-[10px] font-bold tracking-wider uppercase text-white/85">{account.name}</p>
      <p className="text-[9px] text-white/50 mt-0.5">{account.institution}</p>
      <p className="text-[17px] font-extrabold text-white mt-3 tracking-tight leading-none">
        {Number(account.balance).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] text-white/55 mt-0.5">MYR</p>
    </div>
  )
}
